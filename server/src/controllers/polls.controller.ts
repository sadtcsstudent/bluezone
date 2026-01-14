import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

type PollWithRelations = Awaited<ReturnType<typeof loadPollWithRelations>>;

// ... (imports remain same)

const formatPoll = (poll: PollWithRelations, currentUserId?: string, includeMeta = false) => {
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

  // Changed: Return array of voted option IDs
  const userVotedOptionIds = currentUserId
    ? poll.options
      .filter((opt) => opt.votes.some((vote) => vote.userId === currentUserId))
      .map(opt => opt.id)
    : [];

  const payload: any = {
    id: poll.id,
    question: poll.question,
    active: poll.active,
    allowMultiple: poll.allowMultiple,      // Added
    allowChangeVote: poll.allowChangeVote,  // Added
    createdAt: poll.createdAt,
    totalVotes,
    userVotedOptionIds,                     // Changed from userVotedOptionId
    userVotedOptionId: userVotedOptionIds[0] || null, // Backwards compatibility for now
    options: poll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt.votes.length,
      percentage: totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0
    }))
  };

  if (includeMeta) {
    payload.updatedAt = poll.updatedAt;
    payload.createdBy = poll.createdBy
      ? { id: poll.createdBy.id, name: poll.createdBy.name, email: poll.createdBy.email }
      : null;
  }

  return payload;
};

const sanitizeOptions = (options: any[]) =>
  options
    .map((opt) => {
      if (typeof opt === 'string') return { text: opt.trim() };
      return { id: opt?.id, text: (opt?.text || '').trim() };
    })
    .filter((opt) => opt.text);

const loadPollWithRelations = (id: string) =>
  prisma.poll.findUnique({
    where: { id },
    include: { options: { include: { votes: true } }, createdBy: true }
  });

export const createPoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, options, active, allowMultiple, allowChangeVote } = req.body;
    if (!req.user || !['admin', 'company'].includes(req.user.role)) throw new AppError(403, 'Insufficient permissions');

    const sanitized = Array.isArray(options) ? sanitizeOptions(options) : [];
    if (!question || sanitized.length < 2) {
      throw new AppError(400, 'Provide a question and at least two options');
    }

    const poll = await prisma.poll.create({
      data: {
        question: question.trim(),
        active: typeof active === 'boolean' ? active : true,
        allowMultiple: typeof allowMultiple === 'boolean' ? allowMultiple : false,
        allowChangeVote: typeof allowChangeVote === 'boolean' ? allowChangeVote : false,
        createdById: req.user.id,
        options: { create: sanitized.map((opt) => ({ text: opt.text })) }
      },
      include: { options: { include: { votes: true } }, createdBy: true }
    });

    res.status(201).json({ poll: formatPoll(poll, req.user.id, true) });
  } catch (error) {
    next(error);
  }
};

export const getPolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const polls = await prisma.poll.findMany({
      where: { active: true },
      include: { options: { include: { votes: true } }, createdBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ polls: polls.map((p) => formatPoll(p, req.user?.id)) });
  } catch (error) {
    next(error);
  }
};

export const getAdminPolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['admin', 'company'].includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    const where: any = {};
    if (req.user.role === 'company') {
      where.createdById = req.user.id;
    }

    const polls = await prisma.poll.findMany({
      where,
      include: { options: { include: { votes: true } }, createdBy: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ polls: polls.map((p) => formatPoll(p, req.user.id, true)) });
  } catch (error) {
    next(error);
  }
};

export const updatePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { question, active, options, allowMultiple, allowChangeVote } = req.body;

    if (!req.user || !['admin', 'company'].includes(req.user.role)) throw new AppError(403, 'Insufficient permissions');

    const existing = await loadPollWithRelations(id);
    if (!existing) throw new AppError(404, 'Poll not found');

    if (req.user.role === 'company' && existing.createdById !== req.user.id) {
      throw new AppError(403, 'You can only edit your own polls');
    }

    const data: any = {};
    if (typeof question === 'string' && question.trim()) data.question = question.trim();
    if (typeof active === 'boolean') data.active = active;
    if (typeof allowMultiple === 'boolean') data.allowMultiple = allowMultiple;
    if (typeof allowChangeVote === 'boolean') data.allowChangeVote = allowChangeVote;

    let updatedPoll: PollWithRelations | null = null;
    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.poll.update({ where: { id }, data });
      }

      // ... (options update logic remains largely same, just ensure it works)
      if (Array.isArray(options)) {
        const sanitized = sanitizeOptions(options);
        if (sanitized.length < 2) throw new AppError(400, 'Poll must have at least two options');

        const incomingIds = sanitized.filter((opt) => !!opt.id).map((opt) => opt.id!);
        const existingIds = existing.options.map((opt) => opt.id);
        const deleteIds = existingIds.filter((id) => !incomingIds.includes(id));
        if (deleteIds.length) {
          await tx.pollOption.deleteMany({ where: { id: { in: deleteIds } } });
        }

        for (const opt of sanitized) {
          if (opt.id) {
            await tx.pollOption.update({ where: { id: opt.id }, data: { text: opt.text } });
          } else {
            await tx.pollOption.create({ data: { pollId: id, text: opt.text } });
          }
        }
      }

      updatedPoll = await tx.poll.findUnique({
        where: { id },
        include: { options: { include: { votes: true } }, createdBy: true }
      });
    });

    res.json({ poll: formatPoll(updatedPoll!, req.user.id, true) });
  } catch (error) {
    next(error);
  }
};

export const deletePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user || !['admin', 'company'].includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) throw new AppError(404, 'Poll not found');

    if (req.user.role === 'company' && poll.createdById !== req.user.id) {
      throw new AppError(403, 'You can only delete your own polls');
    }

    await prisma.poll.delete({ where: { id } });
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    next(error);
  }
};

export const votePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pollId, optionId } = req.body;
    if (!req.user) throw new AppError(401, 'Unauthorized');

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true }
    });

    if (!poll || !poll.active) throw new AppError(404, 'Poll not available');

    const validOption = poll.options.find((opt) => opt.id === optionId);
    if (!validOption) throw new AppError(400, 'Option does not belong to this poll');

    // Check existing votes by this user for this poll
    const existingVotes = await prisma.pollVote.findMany({
      where: { pollId, userId: req.user.id }
    });

    const hasVotedForThisOption = existingVotes.some(v => v.optionId === optionId);

    if (poll.allowMultiple) {
      // Toggle logic: if already voted, remove. If not, add.
      if (hasVotedForThisOption) {
        // Remove vote
        await prisma.pollVote.deleteMany({
          where: { pollId, optionId, userId: req.user.id }
        });
      } else {
        // Add vote
        await prisma.pollVote.create({
          data: { pollId, optionId, userId: req.user.id }
        });
      }
    } else {
      // Single choice logic
      if (existingVotes.length > 0) {
        if (hasVotedForThisOption) {
          throw new AppError(400, 'You already voted for this option');
        }

        if (!poll.allowChangeVote) {
          throw new AppError(400, 'Changing vote is not allowed');
        }

        // Change vote: delete all previous votes (should be 1, but safer to deleteMany) and create new
        await prisma.$transaction([
          prisma.pollVote.deleteMany({ where: { pollId, userId: req.user.id } }),
          prisma.pollVote.create({ data: { pollId, optionId, userId: req.user.id } })
        ]);
      } else {
        // New vote
        await prisma.pollVote.create({
          data: { pollId, optionId, userId: req.user.id }
        });
      }
    }

    const updated = await loadPollWithRelations(pollId);
    res.json({ poll: formatPoll(updated!, req.user.id) });
  } catch (error) {
    next(error);
  }
};
