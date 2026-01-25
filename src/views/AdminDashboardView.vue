<template>
  <div class="admin-page">
    <div class="admin-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Sidebar Toggle Button (always visible) -->
      <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
        <Menu :size="18" />
      </button>

      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>{{ $t('admin.panel') }}</h2>
        </div>
        <nav class="admin-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="20" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </aside>


      <!-- Content -->
      <main class="admin-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="admin-panel">
          <div class="panel-header">
            <h2>{{ $t('admin.overview') }}</h2>
            <p>{{ $t('admin.stats.platformHealth') }}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users">
                <Users :size="24" />
              </div>
              <div class="stat-info">
                <h3>{{ $t('admin.stats.totalUsers') }}</h3>
                <p class="stat-value">{{ stats.users || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon events">
                <Calendar :size="24" />
              </div>
              <div class="stat-info">
                <h3>{{ $t('admin.stats.activeEvents') }}</h3>
                <p class="stat-value">{{ stats.events || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon groups">
                <Users :size="24" />
              </div>
              <div class="stat-info">
                <h3>{{ $t('admin.stats.groups') }}</h3>
                <p class="stat-value">{{ stats.groups || 0 }}</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon initiatives">
                <Leaf :size="24" />
              </div>
              <div class="stat-info">
                <h3>{{ $t('admin.stats.initiatives') }}</h3>
                <p class="stat-value">{{ stats.initiatives || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="admin-panel">
          <div class="panel-header">
            <h2>{{ $t('admin.usersTab.title') }}</h2>
            <div class="search-input">
              <Search :size="16" />
              <input v-model="userSearch" type="text" :placeholder="$t('admin.usersTab.searchPlaceholder')" />
            </div>
            <button
              v-if="selectedUsers.length > 0"
              class="btn btn--danger btn--sm"
              style="margin-left: 1rem;"
              @click="deleteSelectedUsers"
            >
              <Trash2 :size="16" />
              {{ $t('admin.usersTab.deleteSelected', { count: selectedUsers.length }) }}
            </button>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      :checked="selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length"
                      @change="toggleAllUsers"
                    />
                  </th>
                  <th>{{ $t('admin.usersTab.table.user') }}</th>
                  <th>{{ $t('admin.usersTab.table.role') }}</th>
                  <th>{{ $t('admin.usersTab.table.status') }}</th>
                  <th>{{ $t('admin.usersTab.table.joined') }}</th>
                  <th>{{ $t('admin.usersTab.table.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <input 
                      type="checkbox" 
                      :checked="selectedUsers.includes(user.id)"
                      @change="toggleUserSelection(user.id)"
                    />
                  </td>
                  <td>
                    <div class="user-cell">
                      <div class="avatar-sm">
                        {{ (user.name || user.email)[0].toUpperCase() }}
                      </div>
                      <div class="user-info">
                        <span class="user-name">{{ user.name || $t('admin.usersTab.unnamed') }}</span>
                        <span class="user-email">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      :value="user.role"
                      @change="updateUserRole(user, $event.target.value)"
                      class="role-select"
                    >
                      <option value="user">{{ $t('admin.usersTab.roles.user') }}</option>
                      <option value="company">{{ $t('admin.usersTab.roles.company') }}</option>
                      <option value="admin">{{ $t('admin.usersTab.roles.admin') }}</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge status-badge" :class="user.suspended ? 'suspended' : (user.lockoutUntil && new Date(user.lockoutUntil) > new Date() ? 'locked' : 'active')">
                      {{ user.suspended ? $t('admin.usersTab.status.suspended') : (user.lockoutUntil && new Date(user.lockoutUntil) > new Date() ? $t('admin.usersTab.status.locked') : $t('admin.usersTab.status.active')) }}
                    </span>
                  </td>
                  <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
                  <td>
                    <div class="actions-cell">
                      <button
                        v-if="user.lockoutUntil && new Date(user.lockoutUntil) > new Date()"
                        class="action-btn unlock"
                        :title="$t('admin.usersTab.actions.unlockAccount')"
                        @click="unlockAccount(user)"
                      >
                        <Unlock :size="16" />
                      </button>
                      <button
                        class="action-btn"
                        :title="user.suspended ? $t('admin.usersTab.actions.unsuspend') : $t('admin.usersTab.actions.suspend')"
                        @click="toggleSuspend(user)"
                      >
                        <Ban :size="16" />
                      </button>
                      <button
                        class="action-btn delete"
                        :title="$t('common.delete')"
                        @click="deleteUser(user)"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="admin-panel">
          <div class="panel-header">
            <h2>{{ $t('admin.eventsTab.manageEvents') }}</h2>
            <button class="btn btn--primary" @click="openCreateEvent">
              <Plus :size="16" />
              {{ $t('admin.eventsTab.createEvent') }}
            </button>
          </div>

          <div class="empty-state" v-if="events.length === 0">
            <Calendar :size="48" />
            <h3>{{ $t('admin.eventsTab.noEvents') }}</h3>
          </div>

          <div class="events-list">
             <div v-for="event in events" :key="event.id" class="admin-event-card">
               <div class="event-info">
                 <h3>{{ event.title }}</h3>
                 <p>{{ new Date(event.date).toLocaleDateString() }} • {{ event.location }}</p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditEvent(event)">{{ $t('common.edit') }}</button>
                 <button class="btn btn--sm btn--danger" @click="deleteEvent(event.id)">{{ $t('common.delete') }}</button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="events.length < eventsTotal">
            <button class="btn btn--outline" @click="fetchEvents()">{{ $t('admin.eventsTab.loadMore') }}</button>
          </div>
        </div>

        <!-- Categories Tab -->
        <div v-if="activeTab === 'categories'" class="admin-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('admin.categoriesTab.title') }}</h2>
              <p>{{ $t('admin.categoriesTab.subtitle') }}</p>
            </div>
            <button class="btn btn--primary" @click="openCreateCategory">
              <Plus :size="16" />
              {{ $t('admin.categoriesTab.createCategory') }}
            </button>
          </div>

          <div class="empty-state" v-if="categories.length === 0">
            <Tag :size="48" />
            <h3>{{ $t('admin.categoriesTab.noCategories') }}</h3>
            <p>{{ $t('admin.categoriesTab.createFirst') }}</p>
          </div>

          <draggable
            v-model="categories"
            class="categories-grid"
            item-key="id"
            @end="saveCategoryOrder"
            :animation="200"
            handle=".drag-handle"
            v-else
          >
            <template #item="{ element: category }">
              <div class="category-card">
                <div class="drag-handle">
                  <GripVertical :size="20" />
                </div>
                <div class="category-card__header">
                  <div class="category-icon" :style="{ background: category.color }">
                    <component :is="getIconComponent(category.icon)" :size="24" />
                  </div>
                  <div class="category-info">
                    <h3>{{ category.name }}</h3>
                    <p>{{ $t('admin.categoriesTab.eventsCount', { count: category._count?.events || 0 }) }}</p>
                  </div>
                </div>
                <div class="category-actions">
                  <button class="btn btn--sm btn--outline" @click="openEditCategory(category)">
                    {{ $t('common.edit') }}
                  </button>
                  <button
                    class="btn btn--sm btn--danger"
                    @click="deleteCategory(category.id)"
                    :disabled="category._count?.events > 0"
                  >
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Polls Tab -->
        <div v-if="activeTab === 'polls'" class="admin-panel">
          <div class="panel-header">
            <div>
              <h2>{{ $t('admin.pollsTab.pollsManager') }}</h2>
              <p>{{ $t('admin.pollsTab.subtitle') }}</p>
            </div>
            <button class="btn btn--primary btn--sm" @click="openPollModal">
              <Plus :size="16" />
              New Poll
            </button>
          </div>

          <!-- Polls List -->
          <div v-if="pollsLoading" class="empty-state">
            <MessageSquare :size="32" />
            <p>Loading polls...</p>
          </div>
          <div v-else-if="polls.length === 0" class="empty-state">
            <MessageSquare :size="48" />
            <h3>No polls yet</h3>
            <p>Start a new poll to gather quick feedback.</p>
          </div>
          <div v-else class="polls-list-container">
            <div class="poll-card" v-for="poll in polls" :key="poll.id">
              <div class="poll-card__header">
                <div class="poll-card__info">
                  <div class="status-pill" :class="poll.active ? 'active' : 'inactive'">
                    {{ poll.active ? 'Active' : 'Paused' }}
                  </div>
                  <h3>{{ poll.question }}</h3>
                  <p class="meta">
                    {{ new Date(poll.createdAt).toLocaleDateString() }} • {{ poll.totalVotes }} vote{{ poll.totalVotes === 1 ? '' : 's' }}
                  </p>
                  <div class="poll-badges">
                    <span v-if="poll.allowMultiple" class="badge badge--info">Multi-Select</span>
                    <span v-if="poll.allowChangeVote" class="badge badge--success">Changeable</span>
                  </div>
                </div>
                <div class="poll-actions">
                  <button class="btn btn--sm btn--outline" @click="editPoll(poll)">Edit</button>
                  <button
                    class="btn btn--sm"
                    :class="poll.active ? 'btn--ghost' : 'btn--primary'"
                    @click="togglePollStatus(poll)"
                  >
                    {{ poll.active ? 'Pause' : 'Activate' }}
                  </button>
                  <button class="btn btn--sm btn--danger" @click="confirmDeletePoll(poll)">Delete</button>
                </div>
              </div>
              <div class="poll-options-list">
                <div class="poll-option-row" v-for="option in poll.options" :key="option.id">
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-stats">{{ option.voteCount }} votes ({{ option.percentage }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Forum Moderation Tab -->
        <div v-if="activeTab === 'moderation'" class="admin-panel">
          <div class="panel-header">
            <h2>{{ $t('admin.moderationTab.title') }}</h2>
            <p>{{ $t('admin.moderationTab.subtitle') }}</p>
          </div>

          <div class="moderation-list">
            <div v-for="discussion in discussions" :key="discussion.id" class="moderation-card">
              <div class="mod-content">
                <h3>{{ discussion.title }}</h3>
                <p class="mod-preview">{{ discussion.content.substring(0, 100) }}...</p>
                <div class="mod-meta">
                  <span>By {{ discussion.author?.name || 'Unknown' }}</span>
                  <span>{{ new Date(discussion.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="mod-actions">
                <button class="btn btn--sm btn--danger" @click="deleteDiscussion(discussion.id)">
                  <Trash2 :size="16" /> {{ $t('common.delete') }}
                </button>
              </div>
            </div>
          </div>
          <div class="load-more-row" v-if="discussions.length < discussionsTotal">
            <button class="btn btn--outline" @click="fetchDiscussions()">{{ $t('admin.moderationTab.loadMore') }}</button>
          </div>
        </div>

        <!-- Content Tab -->
        <div v-if="activeTab === 'content'" class="admin-panel admin-panel--content">
          <div class="panel-header panel-header--sticky">
            <div>
              <h2>{{ $t('admin.contentTab.title') }}</h2>
              <p>{{ $t('admin.contentTab.subtitle') }}</p>
            </div>
            <button class="btn btn--primary" @click="saveContentChanges" :disabled="contentSaving">
              <Check :size="16" />
              {{ contentSaving ? $t('admin.contentTab.saving') : $t('admin.contentTab.saveChanges') }}
            </button>
          </div>

          <!-- Section Tabs -->
          <div class="content-tabs">
            <button
              class="content-tab"
              :class="{ active: contentSection === 'all' }"
              @click="contentSection = 'all'"
            >
              All
            </button>
            <button
              v-for="section in contentSections"
              :key="section"
              class="content-tab"
              :class="{ active: contentSection === section }"
              @click="contentSection = section"
            >
              {{ formatSectionName(section) }}
              <span class="content-tab-count">{{ getSectionCount(section) }}</span>
            </button>
          </div>

          <div class="content-controls">
            <div class="search-input search-input--wide">
              <Search :size="16" />
              <input
                v-model="contentSearch"
                type="text"
                :placeholder="$t('admin.contentTab.searchPlaceholder')"
              />
            </div>
          </div>

          <div v-if="!contentReady" class="empty-state">
            <p>{{ $t('common.loading') }}</p>
          </div>

          <div v-else class="content-list">
            <div v-if="filteredContentKeys.length === 0" class="empty-state">
              <p>{{ $t('admin.contentTab.noResults') }}</p>
            </div>

            <!-- Grouped by subsection -->
            <div v-else class="content-sections">
              <div
                v-for="group in groupedContentKeys"
                :key="group.name"
                class="content-section"
              >
                <button
                  class="content-section-header"
                  @click="toggleSection(group.name)"
                >
                  <ChevronRight
                    :size="18"
                    class="section-chevron"
                    :class="{ expanded: expandedSections.has(group.name) }"
                  />
                  <span class="section-name">{{ group.displayName }}</span>
                  <span class="section-count">{{ group.keys.length }} items</span>
                </button>

                <div
                  v-show="expandedSections.has(group.name)"
                  class="content-section-body"
                >
                  <div v-for="key in group.keys" :key="key" class="content-row content-row--compact">
                    <div class="content-key">
                      <span class="content-key-text">{{ getKeyName(key) }}</span>
                      <div class="content-format">
                        <select v-model="contentDrafts[key].format" class="format-select">
                          <option value="plain">Plain</option>
                          <option value="markdown">Markdown</option>
                        </select>
                      </div>
                    </div>
                    <div class="content-locales">
                      <div class="content-locale">
                        <div class="locale-header">
                          <label>EN</label>
                          <button
                            v-if="hasOverride(key, 'en')"
                            class="link-btn link-btn--small"
                            type="button"
                            @click="resetContentValue(key, 'en')"
                          >
                            Reset
                          </button>
                        </div>
                        <textarea v-model="contentDrafts[key].en" rows="2"></textarea>
                      </div>
                      <div class="content-locale">
                        <div class="locale-header">
                          <label>NL</label>
                          <button
                            v-if="hasOverride(key, 'nl')"
                            class="link-btn link-btn--small"
                            type="button"
                            @click="resetContentValue(key, 'nl')"
                          >
                            Reset
                          </button>
                        </div>
                        <textarea v-model="contentDrafts[key].nl" rows="2"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Newsletter Tab -->
        <div v-if="activeTab === 'newsletter'" class="admin-panel admin-panel--fullpage">
          <div class="panel-header">
            <h2>{{ $t('admin.newsletterTab.title') }}</h2>
            <p>{{ $t('admin.newsletterTab.subtitle') }}</p>
          </div>

          <form @submit.prevent="sendNewsletter" class="newsletter-form newsletter-form--fullpage">
            <div class="form-group">
              <label>{{ $t('admin.newsletterTab.subjectLabel') }}</label>
              <input v-model="newsletter.subject" type="text" required :placeholder="$t('admin.newsletterTab.subjectPlaceholder')" />
            </div>

            <div class="form-group">
              <label>{{ $t('admin.newsletterTab.imageLabel') }}</label>
              <label class="file-upload-label">
                <div class="upload-placeholder" v-if="!newsletterImagePreview && !newsletter.imageUrl">
                  <Upload :size="24" />
                  <span>{{ $t('admin.newsletterTab.imageLabel') }}</span>
                </div>
                <img v-else :src="newsletterImagePreview || newsletter.imageUrl" class="image-preview" />
                <input type="file" accept="image/*" @change="handleNewsletterImageSelect" class="file-input" />
              </label>
              <button
                v-if="newsletterImagePreview || newsletter.imageUrl"
                type="button"
                class="btn btn--sm btn--ghost remove-image"
                @click="clearNewsletterImage"
              >
                <X :size="16" /> {{ $t('admin.newsletterTab.removeImage') }}
              </button>
              <p class="help-text">{{ $t('admin.newsletterTab.imageHelp') }}</p>
            </div>

            <div class="form-group form-group--fullheight">
              <label>{{ $t('admin.newsletterTab.contentLabel') }}</label>
              <textarea
                v-model="newsletter.content"
                rows="20"
                required
                :placeholder="$t('admin.newsletterTab.contentPlaceholder')"
                class="textarea--fullheight"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn--outline">{{ $t('admin.newsletterTab.preview') }}</button>
              <button type="submit" class="btn btn--primary" :disabled="sending">
                {{ sending ? $t('admin.newsletterTab.sending') : $t('admin.newsletterTab.sendNewsletter') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Initiatives Tab -->
        <div v-if="activeTab === 'initiatives'" class="admin-panel">
          <div class="panel-header">
            <h2>{{ $t('admin.initiativesTab.title') }}</h2>
             <button class="btn btn--primary" @click="openCreateInitiative">
              <Plus :size="16" />
              {{ $t('admin.initiativesTab.addInitiative') }}
            </button>
          </div>

          <div class="empty-state" v-if="initiatives.length === 0">
            <Leaf :size="48" />
            <h3>{{ $t('admin.initiativesTab.noInitiatives') }}</h3>
          </div>

          <div class="events-list">
             <div v-for="initiative in visibleInitiatives" :key="initiative.id" class="admin-event-card">
               <div class="event-info">
                 <h3>{{ initiative.name }}</h3>
                 <p class="meta-info">
                   <span :class="['type-badge', `type-badge--${initiative.type}`]">{{ initiative.type }}</span>
                   <span>• {{ initiative.location }}</span>
                 </p>
               </div>
               <div class="event-actions">
                 <button class="btn btn--sm btn--outline" @click="openEditInitiative(initiative)">{{ $t('common.edit') }}</button>
                 <button class="btn btn--sm btn--danger" @click="deleteInitiative(initiative.id)">{{ $t('common.delete') }}</button>
               </div>
             </div>
          </div>
          <div class="load-more-row" v-if="visibleInitiatives.length < initiatives.length">
            <button class="btn btn--outline" @click="initiativesShown += 10">{{ $t('admin.initiativesTab.loadMore') }}</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateEvent" class="modal-overlay" @click.self="showCreateEvent = false">
      <div class="modal-content modal-content--lg modal-content--scrollable">
        <h2>{{ isEditing ? 'Edit Event' : 'Create Event' }}</h2>
        <form @submit.prevent="saveEvent" class="create-form">

          <div class="form-group">
            <label class="file-upload-label">
              <div class="upload-placeholder" v-if="!imagePreview">
                <Upload :size="24" />
                <span>Upload Event Photo</span>
              </div>
              <img v-else :src="imagePreview" class="image-preview" />
              <input type="file" accept="image/*" @change="handleImageSelect" class="file-input" />
            </label>
            <button v-if="imagePreview" type="button" class="btn btn--sm btn--ghost remove-image" @click="imagePreview = null; selectedImage = null; newEvent.imageUrl = ''">
              <X :size="16" /> Remove Image
            </button>
          </div>

          <div class="form-group">
            <label>Event Title</label>
            <input v-model="newEvent.title" placeholder="Enter event title" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date & Time</label>
              <input v-model="newEvent.date" type="datetime-local" required />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select v-model="newEvent.categoryId" required>
                <option value="" disabled>Select a category</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Location (Click on map or search address)</label>
            <div class="form-group" style="margin-bottom: 1rem;">
              <div class="search-row" style="display: flex; gap: 0.5rem;">
                <input
                  v-model="eventAddressQuery"
                  placeholder="Type an address to find..."
                  @keydown.enter.prevent="searchEventAddress"
                  style="flex: 1;"
                />
                <button type="button" class="btn btn--outline" @click="searchEventAddress" :disabled="searchingEventAddress">
                  <Search :size="16" />
                  {{ searchingEventAddress ? '...' : 'Find' }}
                </button>
              </div>
            </div>
            <div id="event-picker-map" class="picker-map picker-map--tall"></div>
            <p class="help-text">Click on the map to select event location</p>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newEvent.description" placeholder="Describe your event..." required rows="4"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showCreateEvent = false">Cancel</button>
            <button type="submit" class="btn btn--primary">{{ isEditing ? 'Save Changes' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Initiative Modal -->
     <div v-if="showCreateInitiative" class="modal-overlay" @click.self="closeCreateInitiative">
      <div class="modal-content modal-content--lg modal-content--scrollable">
        <h2>{{ isEditingInitiative ? 'Edit Initiative' : 'Add Community Initiative' }}</h2>
        <form @submit.prevent="saveInitiative" class="create-form">
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input v-model="newInitiative.name" placeholder="Initiative Name" required />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select v-model="newInitiative.type" required>
                <option value="garden">Community Garden</option>
                <option value="market">Farmers Market</option>
                <option value="event">Local Event</option>
                <option value="group">Walking/Activity Group</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newInitiative.description" placeholder="Describe the initiative..." required rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contact Info (Optional)</label>
              <input v-model="newInitiative.contact" placeholder="Email or Phone" />
            </div>
            <div class="form-group">
              <label>Website (Optional)</label>
              <input v-model="newInitiative.website" placeholder="www.example.com" />
            </div>
          </div>

          <div class="form-group">
            <label>Location (Click on map or search address)</label>
            <div class="form-group" style="margin-bottom: 1rem;">
              <div class="search-row" style="display: flex; gap: 0.5rem;">
                <input
                  v-model="addressQuery"
                  placeholder="Type an address to find..."
                  @keydown.enter.prevent="searchAddress"
                  style="flex: 1;"
                />
                <button type="button" class="btn btn--outline" @click="searchAddress" :disabled="searchingAddress">
                  <Search :size="16" />
                  {{ searchingAddress ? '...' : 'Find' }}
                </button>
              </div>
            </div>
            <div id="picker-map" class="picker-map picker-map--tall"></div>
            <p class="help-text">Selected coordinates: {{ newInitiative.latitude?.toFixed(4) ?? 'N/A' }}, {{ newInitiative.longitude?.toFixed(4) ?? 'N/A' }}</p>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="closeCreateInitiative">Cancel</button>
            <button type="submit" class="btn btn--primary">{{ isEditingInitiative ? 'Save Changes' : 'Create Initiative' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal-content">
        <h2>{{ isEditingCategory ? 'Edit Category' : 'Create Category' }}</h2>
        <form @submit.prevent="saveCategory" class="create-form">
          <div class="form-group">
            <label>Category Name</label>
            <input
              v-model="newCategory.name"
              placeholder="e.g. Sports & Fitness"
              required
              maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>Icon</label>
            <div class="icon-picker-wrapper">
              <button
                type="button"
                class="icon-preview-btn"
                @click="showIconPicker = !showIconPicker"
              >
                <div class="icon-preview" :style="{ background: newCategory.color }">
                  <component :is="getIconComponent(newCategory.icon)" :size="24" />
                </div>
                <span>{{ newCategory.icon }}</span>
              </button>

              <div v-if="showIconPicker" class="icon-picker-dropdown">
                <input
                  v-model="iconSearchQuery"
                  type="text"
                  placeholder="Search icons..."
                  class="icon-search"
                />
                <div class="icons-grid">
                  <button
                    v-for="icon in filteredIcons"
                    :key="icon"
                    type="button"
                    class="icon-option"
                    :class="{ 'icon-option--active': newCategory.icon === icon }"
                    @click="selectIcon(icon)"
                    :title="icon"
                  >
                    <component :is="getIconComponent(icon)" :size="20" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Color</label>
            <div class="color-picker-wrapper">
              <div class="color-presets">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.value"
                  type="button"
                  class="color-preset"
                  :style="{ background: preset.value }"
                  :class="{ 'color-preset--active': newCategory.color === preset.value }"
                  @click="newCategory.color = preset.value"
                  :title="preset.name"
                />
              </div>
              <input
                v-model="newCategory.color"
                type="color"
                class="color-input"
              />
              <input
                v-model="newCategory.color"
                type="text"
                placeholder="#3b82f6"
                pattern="^#[0-9A-Fa-f]{6}$"
                class="color-text-input"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="showCategoryModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn--primary">
              {{ isEditingCategory ? 'Save Changes' : 'Create Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Poll Modal -->
    <div v-if="showPollModal" class="modal-overlay" @click.self="showPollModal = false">
      <div class="modal-content modal-content--poll">
        <h2>{{ editingPollId ? 'Edit Poll' : 'Create New Poll' }}</h2>
        <form @submit.prevent="savePoll" class="create-form">
          <div class="form-group">
            <label>Poll Question</label>
            <input
              v-model="pollForm.question"
              placeholder="What would you like to ask?"
              required
              maxlength="200"
            />
          </div>

          <div class="form-group">
            <label>Poll Options</label>
            <div v-for="(option, index) in pollForm.options" :key="index" class="poll-option-input">
              <input
                v-model="option.text"
                :placeholder="`Option ${index + 1}`"
                required
              />
              <button
                v-if="pollForm.options.length > 2"
                type="button"
                class="btn btn--sm btn--ghost"
                @click="removePollOption(index)"
              >
                <X :size="16" />
              </button>
            </div>
            <button
              type="button"
              class="btn btn--sm btn--outline"
              @click="addPollOption"
              style="margin-top: 0.5rem;"
            >
              <Plus :size="16" />
              Add Option
            </button>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input type="checkbox" v-model="pollForm.allowMultiple" />
              <span>Allow multiple selections</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input type="checkbox" v-model="pollForm.allowChangeVote" />
              <span>Allow users to change their vote</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input type="checkbox" v-model="pollForm.active" />
              <span>Active (visible to users)</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" @click="closePollModal">
              Cancel
            </button>
            <button type="submit" class="btn btn--primary" :disabled="pollSaving">
              {{ pollSaving ? 'Saving...' : (editingPollId ? 'Save Changes' : 'Create Poll') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import {
  LayoutDashboard, Users, Calendar, Mail, Leaf, FileText,
  Search, Ban, Trash2, Plus, MessageSquare, Unlock, MapPin, PieChart, Menu,
  Tag, X, Check, Upload, GripVertical, ChevronRight
} from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { availableIcons, colorPresets } from '@/utils/iconsList'
import draggable from 'vuedraggable'
import enMessages from '@/locales/en.json'
import nlMessages from '@/locales/nl.json'
import { flattenMessages } from '@/utils/i18n'
import { loadI18nOverrides } from '@/i18n'

const { t } = useI18n()

const sidebarCollapsed = ref(false)
const activeTab = ref('overview')
const stats = ref({})
const users = ref([])
const events = ref([])
const eventsTotal = ref(0)
const eventsOffset = ref(0)
const initiatives = ref([])
const initiativesShown = ref(10)
const discussions = ref([])
const discussionsTotal = ref(0)
const discussionsOffset = ref(0)
const polls = ref([])
const pollsLoading = ref(false)
const showPollModal = ref(false)
const pollForm = ref({
  question: '',
  active: true,
  allowMultiple: false,
  allowChangeVote: false,
  options: [{ text: '' }, { text: '' }]
})
const editingPollId = ref(null)
const pollSaving = ref(false)
const userSearch = ref('')
const showCreateEvent = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const sending = ref(false)
const addressQuery = ref('')
const searchingAddress = ref(false)
const eventAddressQuery = ref('')
const searchingEventAddress = ref(false)

const newsletter = ref({ subject: '', content: '', imageUrl: '' })
const newsletterImageFile = ref(null)
const newsletterImagePreview = ref(null)
const newEvent = ref({ title: '', date: '', location: '', description: '', categoryId: '', imageUrl: '' })
const selectedImage = ref(null)
const imagePreview = ref(null)
const newInitiative = ref({
  name: '',
  type: 'garden',
  description: '',
  contact: '',
  website: '',
  location: '',
  latitude: null,
  longitude: null
})
const showCreateInitiative = ref(false)
const isEditingInitiative = ref(false)
const editingInitiativeId = ref(null)
const map = ref(null)
const mapMarker = ref(null)
const eventMap = ref(null)
const eventMapMarker = ref(null)

// Categories state
const categories = ref([])
const showCategoryModal = ref(false)
const isEditingCategory = ref(false)
const editingCategoryId = ref(null)
const newCategory = ref({ name: '', icon: 'Tag', color: '#3b82f6' })
const showIconPicker = ref(false)
const iconSearchQuery = ref('')

const contentSearch = ref('')
const contentSection = ref('all')
const contentSaving = ref(false)
const contentReady = ref(false)
const i18nOverrides = ref({})
const i18nFormats = ref({})
const contentDrafts = ref({})
const expandedSections = ref(new Set())

const baseMessages = {
  en: flattenMessages(enMessages),
  nl: flattenMessages(nlMessages)
}

const tabs = computed(() => [
  { id: 'overview', label: t('admin.tabs.overview'), icon: LayoutDashboard },
  { id: 'users', label: t('admin.tabs.users'), icon: Users },
  { id: 'events', label: t('admin.tabs.events'), icon: Calendar },
  { id: 'categories', label: t('admin.tabs.categories'), icon: Tag },
  { id: 'polls', label: t('admin.tabs.polls'), icon: PieChart },
  { id: 'initiatives', label: t('admin.tabs.initiatives'), icon: Leaf },
  { id: 'moderation', label: t('admin.tabs.moderation'), icon: MessageSquare },
  { id: 'content', label: t('admin.tabs.content'), icon: FileText },
  { id: 'newsletter', label: t('admin.tabs.newsletter'), icon: Mail }
])

const visibleInitiatives = computed(() => initiatives.value.slice(0, initiativesShown.value))

const filteredIcons = computed(() => {
  if (!iconSearchQuery.value) return availableIcons
  return availableIcons.filter(icon =>
    icon.toLowerCase().includes(iconSearchQuery.value.toLowerCase())
  )
})

const allContentKeys = computed(() => {
  const keys = new Set([
    ...Object.keys(baseMessages.en),
    ...Object.keys(baseMessages.nl),
    ...Object.keys(i18nOverrides.value)
  ])
  return Array.from(keys).sort()
})

const contentSections = computed(() => {
  const sections = new Set()
  allContentKeys.value.forEach((key) => {
    sections.add(key.split('.')[0])
  })
  return Array.from(sections).sort()
})

const filteredContentKeys = computed(() => {
  const query = contentSearch.value.trim().toLowerCase()
  return allContentKeys.value.filter((key) => {
    if (contentSection.value !== 'all' && key.split('.')[0] !== contentSection.value) {
      return false
    }
    if (!query) return true
    return key.toLowerCase().includes(query)
  })
})

// Group filtered keys by subsection (second part of the key)
const groupedContentKeys = computed(() => {
  const groups = new Map()

  filteredContentKeys.value.forEach((key) => {
    const parts = key.split('.')
    // Group by first two parts (e.g., "story.hero" or "nav")
    const groupKey = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0]

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        name: groupKey,
        displayName: formatGroupName(groupKey),
        keys: []
      })
    }
    groups.get(groupKey).keys.push(key)
  })

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const formatSectionName = (section) => {
  // Convert camelCase/lowercase to Title Case
  return section
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

const formatGroupName = (groupKey) => {
  const parts = groupKey.split('.')
  return parts
    .map((part) => part.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()))
    .join(' > ')
}

const getKeyName = (key) => {
  // Return only the last part(s) of the key for cleaner display
  const parts = key.split('.')
  return parts.slice(2).join('.') || parts[parts.length - 1]
}

const getSectionCount = (section) => {
  return allContentKeys.value.filter((key) => key.split('.')[0] === section).length
}

const toggleSection = (sectionName) => {
  if (expandedSections.value.has(sectionName)) {
    expandedSections.value.delete(sectionName)
  } else {
    expandedSections.value.add(sectionName)
  }
  // Force reactivity
  expandedSections.value = new Set(expandedSections.value)
}

const getIconComponent = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Tag
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withRetry = async (requestFn, retries = 2, delayMs = 1200) => {
  try {
    return await requestFn()
  } catch (err) {
    if (retries <= 0) throw err
    await wait(delayMs)
    return withRetry(requestFn, retries - 1, delayMs * 2)
  }
}

const buildContentDrafts = () => {
  const drafts = {}
  allContentKeys.value.forEach((key) => {
    const enDefault = baseMessages.en[key] ?? ''
    const nlDefault = baseMessages.nl[key] ?? ''
    const override = i18nOverrides.value[key] || {}

    drafts[key] = {
      en: override.en ?? enDefault,
      nl: override.nl ?? nlDefault,
      format: i18nFormats.value[key] || 'plain',
      defaults: { en: enDefault, nl: nlDefault }
    }
  })
  contentDrafts.value = drafts
}

const fetchI18nOverrides = async () => {
  contentReady.value = false
  try {
    const data = await withRetry(() => api.get('/admin/i18n/overrides'))
    const overrides = {}
    const formats = {}

    ;(data.overrides || []).forEach((item) => {
      if (!overrides[item.key]) overrides[item.key] = {}
      overrides[item.key][item.locale] = item.value
    })

    ;(data.formats || []).forEach((item) => {
      formats[item.key] = item.format
    })

    i18nOverrides.value = overrides
    i18nFormats.value = formats
  } catch (err) {
    console.error('Failed to load content overrides', err)
    useToastStore().error('Failed to load content overrides')
  } finally {
    buildContentDrafts()
    contentReady.value = true
  }
}

const hasOverride = (key, locale) => {
  return typeof i18nOverrides.value[key]?.[locale] !== 'undefined'
}

const resetContentValue = (key, locale) => {
  const defaults = contentDrafts.value[key]?.defaults
  if (!defaults) return

  contentDrafts.value[key][locale] = defaults[locale] ?? ''
}

const saveContentChanges = async () => {
  contentSaving.value = true
  try {
    const overridesPayload = []
    const formatsPayload = []

    allContentKeys.value.forEach((key) => {
      const draft = contentDrafts.value[key]
      if (!draft) return

      const enDefault = draft.defaults?.en ?? ''
      const nlDefault = draft.defaults?.nl ?? ''
      const formatCurrent = draft.format || 'plain'
      const formatExisting = i18nFormats.value[key] || 'plain'

      if (formatCurrent !== formatExisting) {
        formatsPayload.push({ key, format: formatCurrent })
      }

      const overrideEn = i18nOverrides.value[key]?.en
      const overrideNl = i18nOverrides.value[key]?.nl

      if (draft.en === enDefault) {
        if (typeof overrideEn !== 'undefined') {
          overridesPayload.push({ key, locale: 'en', value: null })
        }
      } else if (draft.en !== overrideEn) {
        overridesPayload.push({ key, locale: 'en', value: draft.en })
      }

      if (draft.nl === nlDefault) {
        if (typeof overrideNl !== 'undefined') {
          overridesPayload.push({ key, locale: 'nl', value: null })
        }
      } else if (draft.nl !== overrideNl) {
        overridesPayload.push({ key, locale: 'nl', value: draft.nl })
      }
    })

    if (overridesPayload.length === 0 && formatsPayload.length === 0) {
      useToastStore().success('No content changes to save')
      return
    }

    await withRetry(() =>
      api.put('/admin/i18n/overrides', {
        overrides: overridesPayload,
        formats: formatsPayload
      })
    )

    await fetchI18nOverrides()
    await loadI18nOverrides()
    useToastStore().success('Content updated successfully')
  } catch (err) {
    console.error('Failed to save content overrides', err)
    useToastStore().error('Failed to save content overrides')
  } finally {
    contentSaving.value = false
  }
}

// Category functions
const fetchCategories = async () => {
  try {
    const data = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}

const openCreateCategory = () => {
  newCategory.value = { name: '', icon: 'Tag', color: '#3b82f6' }
  isEditingCategory.value = false
  editingCategoryId.value = null
  showCategoryModal.value = true
}

const openEditCategory = (category) => {
  newCategory.value = {
    name: category.name,
    icon: category.icon,
    color: category.color
  }
  isEditingCategory.value = true
  editingCategoryId.value = category.id
  showCategoryModal.value = true
}

const saveCategory = async () => {
  try {
    if (isEditingCategory.value) {
      await api.put(`/categories/${editingCategoryId.value}`, newCategory.value)
      useToastStore().success('Category updated successfully')
    } else {
      await api.post('/categories', newCategory.value)
      useToastStore().success('Category created successfully')
    }
    showCategoryModal.value = false
    await fetchCategories()
  } catch (err) {
    console.error('Failed to save category', err)
    useToastStore().error(err.response?.data?.message || 'Failed to save category')
  }
}

const deleteCategory = async (id) => {
  if (!confirm(t('admin.categoriesTab.confirmations.delete'))) return
  try {
    await api.delete(`/categories/${id}`)
    useToastStore().success('Category deleted successfully')
    await fetchCategories()
  } catch (err) {
    console.error('Failed to delete category', err)
    useToastStore().error(err.response?.data?.message || 'Failed to delete category')
  }
}

const selectIcon = (icon) => {
  newCategory.value.icon = icon
  showIconPicker.value = false
  iconSearchQuery.value = ''
}

const saveCategoryOrder = async () => {
  try {
    const categoryIds = categories.value.map(cat => cat.id)
    await api.put('/categories/reorder', { categoryIds })
  } catch (err) {
    console.error('Failed to reorder categories', err)
    useToastStore().error('Failed to save category order')
    // Refresh to restore original order
    await fetchCategories()
  }
}

const fetchEvents = async (reset = false) => {
  try {
    if (reset) {
      eventsOffset.value = 0
      events.value = []
    }
    const limit = 10
    const data = await api.get(`/events?limit=${limit}&offset=${eventsOffset.value}`)
    const fetched = data.events || []
    eventsTotal.value = data.total || fetched.length
    events.value = [...events.value, ...fetched]
    eventsOffset.value += limit
  } catch (e) {
    console.warn('Events load failed', e)
  }
}

const load = async () => {
  try {
    const statsData = await api.get('/admin/stats')
    stats.value = statsData.stats || {}
    
    const usersData = await api.get('/admin/users')
    users.value = usersData.users || []

    await fetchEvents(true)

    try {
      const initData = await api.get('/initiatives')
      initiatives.value = initData.initiatives || []
      initiativesShown.value = 10
    } catch (e) { console.warn('Initiatives load failed', e) }

  } catch (err) {
    console.error('Failed to load admin data', err)
  }
}

const fetchDiscussions = async (reset = false) => {
  try {
    if (reset) {
      discussionsOffset.value = 0
      discussions.value = []
    }
    const limit = 20
    const data = await api.get(`/forum/discussions?limit=${limit}&offset=${discussionsOffset.value}`)
    const fetched = data.discussions || []
    discussionsTotal.value = data.total || fetched.length
    discussions.value = [...discussions.value, ...fetched]
    discussionsOffset.value += limit
  } catch (err) {
    console.error('Failed to load discussions', err)
  }
}

const fetchPolls = async () => {
  pollsLoading.value = true
  try {
    const data = await api.get('/polls/manage')
    polls.value = data.polls || []
  } catch (err) {
    console.error('Failed to load polls', err)
    polls.value = []
    useToastStore().error('Failed to load polls. Please check your permissions.')
  } finally {
    pollsLoading.value = false
  }
}

const resetPollForm = () => {
  pollForm.value = {
    question: '',
    active: true,
    allowMultiple: false,
    allowChangeVote: false,
    options: [{ text: '' }, { text: '' }]
  }
  editingPollId.value = null
}

const openPollModal = () => {
  resetPollForm()
  showPollModal.value = true
}

const closePollModal = () => {
  showPollModal.value = false
  resetPollForm()
}

const addPollOption = () => {
  pollForm.value.options.push({ text: '' })
}

const removePollOption = (index) => {
  if (pollForm.value.options.length <= 2) {
    alert('Polls need at least two options')
    return
  }
  pollForm.value.options.splice(index, 1)
}

const editPoll = (poll) => {
  editingPollId.value = poll.id
  pollForm.value = {
    question: poll.question,
    active: poll.active,
    allowMultiple: poll.allowMultiple || false,
    allowChangeVote: poll.allowChangeVote || false,
    options: poll.options.map((opt) => ({ id: opt.id, text: opt.text }))
  }
  showPollModal.value = true
}

const confirmDeletePoll = (poll) => {
  if (confirm(t('admin.pollsConfirmations.deleteNamed', { question: poll.question }))) {
    deletePoll(poll)
  }
}

const savePoll = async () => {
  const question = (pollForm.value.question || '').trim()
  const options = pollForm.value.options
    .map((opt) => ({ ...opt, text: (opt.text || '').trim() }))
    .filter((opt) => opt.text)

  if (!question) {
    useToastStore().error('Please add a poll question')
    return
  }

  if (options.length < 2) {
    useToastStore().error('Add at least two options')
    return
  }

  pollSaving.value = true
  try {
    const payload = {
      question,
      active: pollForm.value.active,
      allowMultiple: pollForm.value.allowMultiple,
      allowChangeVote: pollForm.value.allowChangeVote,
      options
    }
    if (editingPollId.value) {
      const res = await api.put(`/polls/${editingPollId.value}`, payload)
      const idx = polls.value.findIndex((p) => p.id === editingPollId.value)
      if (idx !== -1 && res.poll) {
        polls.value.splice(idx, 1, res.poll)
      }
      useToastStore().success('Poll updated successfully')
    } else {
      const res = await api.post('/polls', payload)
      if (res.poll) {
        polls.value = [res.poll, ...polls.value]
      }
      useToastStore().success('Poll created successfully')
    }
    await fetchPolls()
    closePollModal()
  } catch (err) {
    console.error('Failed to save poll', err)
    useToastStore().error('Failed to save poll')
  } finally {
    pollSaving.value = false
  }
}

const togglePollStatus = async (poll) => {
  try {
    const res = await api.put(`/polls/${poll.id}`, { active: !poll.active })
    if (res.poll) {
      const idx = polls.value.findIndex((p) => p.id === poll.id)
      if (idx !== -1) polls.value.splice(idx, 1, res.poll)
    } else {
      poll.active = !poll.active
    }
  } catch (err) {
    console.error('Failed to update poll', err)
    alert('Failed to update poll status')
  }
}

const deletePoll = async (poll) => {
  if (!confirm(t('admin.pollsConfirmations.delete'))) return
  try {
    await api.delete(`/polls/${poll.id}`)
    polls.value = polls.value.filter((p) => p.id !== poll.id)
    if (editingPollId.value === poll.id) resetPollForm()
  } catch (err) {
    console.error('Failed to delete poll', err)
    alert('Failed to delete poll')
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'moderation') {
    fetchDiscussions(true)
  }
  if (newTab === 'events') {
    fetchEvents(true)
  }
  if (newTab === 'categories') {
    fetchCategories()
  }
  if (newTab === 'polls') {
    resetPollForm()
    fetchPolls()
  }
  if (newTab === 'content') {
    fetchI18nOverrides()
  }
})

// Clean up event map when modal closes
watch(showCreateEvent, (isOpen) => {
  if (!isOpen && eventMap.value) {
    eventMap.value.remove()
    eventMap.value = null
    eventMapMarker.value = null
  }
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.email.toLowerCase().includes(q) || 
    (u.name && u.name.toLowerCase().includes(q))
  )
})

const toggleSuspend = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}/suspend`, { suspended: !user.suspended })
    user.suspended = !user.suspended
  } catch (err) {
    console.error('Failed to suspend user', err)
    alert('Failed to update user status')
  }
}

const updateUserRole = async (user, newRole) => {
  if (user.role === newRole) return
  if (!confirm(t('admin.usersTab.confirmations.changeRole', { name: user.name || user.email, role: newRole }))) {
    // Reset selection (this is tricky with simple select, usually requires forcing update)
    // For simplicity, we assume the user confirms or we'd need to re-render.
    // Ideally we force re-render, but let's just proceed.
    return
  }
  
  try {
    await api.put(`/admin/users/${user.id}/role`, { role: newRole })
    user.role = newRole
    alert('User role updated')
  } catch (err) {
    console.error('Failed to update user role', err)
    alert('Failed to update user role')
  }
}

const unlockAccount = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}/unlock`)
    user.lockoutUntil = null
    user.failedLoginAttempts = 0
    alert('Account unlocked successfully')
  } catch (err) {
    console.error('Failed to unlock user', err)
    alert('Failed to unlock account')
  }
}

const deleteUser = async (user) => {
  if (!confirm(t('admin.usersTab.confirmations.deleteUser'))) return
  try {
    await api.delete(`/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (err) {
    console.error('Failed to delete user', err)
    alert('Failed to delete user')
  }
}

const selectedUsers = ref([])

const toggleUserSelection = (userId) => {
  if (selectedUsers.value.includes(userId)) {
    selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
  } else {
    selectedUsers.value.push(userId)
  }
}

const toggleAllUsers = () => {
  if (selectedUsers.value.length === filteredUsers.value.length) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = filteredUsers.value.map(u => u.id)
  }
}

const deleteSelectedUsers = async () => {
  if (selectedUsers.value.length === 0) return
  if (!confirm(t('admin.usersTab.confirmations.deleteMultiple', { count: selectedUsers.value.length }))) return
  
  try {
    await api.post('/admin/users/bulk-delete', { userIds: selectedUsers.value })
    users.value = users.value.filter(u => !selectedUsers.value.includes(u.id))
    selectedUsers.value = []
    alert('Selected users deleted successfully')
  } catch (err) {
    console.error('Failed to delete selected users', err)
    alert('Failed to delete selected users')
  }
}

const openCreateEvent = async () => {
  isEditing.value = false
  editingId.value = null
  newEvent.value = { title: '', date: '', location: '', description: '', categoryId: '', imageUrl: '' }
  selectedImage.value = null
  imagePreview.value = null
  eventAddressQuery.value = ''
  showCreateEvent.value = true

  // Load categories if not already loaded
  if (categories.value.length === 0) {
    await fetchCategories()
  }

  // Initialize event map
  await nextTick()
  initEventMap()
}

const openEditEvent = async (event) => {
  isEditing.value = true
  editingId.value = event.id
  // Format date for datetime-local input
  const dateStr = new Date(event.date).toISOString().slice(0, 16)

  newEvent.value = {
    title: event.title,
    date: dateStr,
    location: event.location,
    description: event.description,
    categoryId: event.categoryId || '',
    imageUrl: event.imageUrl || ''
  }
  selectedImage.value = null
  imagePreview.value = event.imageUrl || null
  eventAddressQuery.value = event.location || ''
  showCreateEvent.value = true

  // Load categories if not already loaded
  if (categories.value.length === 0) {
    await fetchCategories()
  }

  // Initialize event map
  await nextTick()
  initEventMap()
}

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  selectedImage.value = file
  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadEventImage = async () => {
  if (!selectedImage.value) return newEvent.value.imageUrl || ''
  const formData = new FormData()
  formData.append('file', selectedImage.value)
  const res = await api.post('/upload/event-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.url
}

const handleNewsletterImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  newsletterImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    newsletterImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearNewsletterImage = () => {
  newsletterImageFile.value = null
  newsletterImagePreview.value = null
  newsletter.value.imageUrl = ''
}

const uploadNewsletterImage = async () => {
  if (!newsletterImageFile.value) return newsletter.value.imageUrl || ''
  const formData = new FormData()
  formData.append('file', newsletterImageFile.value)
  const res = await api.post('/upload/newsletter-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.url
}

const saveEvent = async () => {
    // Validation
    if (!newEvent.value.title.trim()) {
      useToastStore().error('Event title is required')
      return
    }
    if (!newEvent.value.date) {
      useToastStore().error('Event date is required')
      return
    }
    if (!newEvent.value.location.trim()) {
      useToastStore().error('Event location is required')
      return
    }

    try {
      const payload = { ...newEvent.value }
      if (selectedImage.value) {
        payload.imageUrl = await uploadEventImage()
      }

      if (isEditing.value && editingId.value) {
        await api.put(`/admin/events/${editingId.value}`, payload)
        useToastStore().success('Event updated successfully')
      } else {
        await api.post('/admin/events', payload)
        useToastStore().success('Event created successfully')
      }
      
      showCreateEvent.value = false
      newEvent.value = { title: '', date: '', location: '', description: '', category: 'General', imageUrl: '' }
      selectedImage.value = null
      imagePreview.value = null
      editingId.value = null
      isEditing.value = false
      
      await fetchEvents(true)
    } catch (err) {
      console.error('Failed to save event', err)
      const message = err.response?.data?.message || err.message || 'Failed to save event'
      useToastStore().error(message)
    }
}

const deleteEvent = async (id) => {
  if (!confirm(t('admin.eventsConfirmations.delete'))) return
  try {
    await api.delete(`/admin/events/${id}`)
    await fetchEvents(true)
  } catch (err) {
    console.error('Failed to delete event', err)
  }
}

const deleteDiscussion = async (id) => {
  if (!confirm(t('admin.moderationTab.confirmations.deleteDiscussion'))) return
  try {
    await api.delete(`/forum/discussions/${id}`)
    discussions.value = discussions.value.filter(d => d.id !== id)
    discussionsTotal.value = Math.max(discussionsTotal.value - 1, discussions.value.length)
  } catch (err) {
    console.error('Failed to delete discussion', err)
    alert('Failed to delete discussion')
  }
}

const sendNewsletter = async () => {
  if (!newsletter.value.subject || !newsletter.value.content) {
    alert('Please fill in both subject and content');
    return;
  }
  
  if (!confirm(t('admin.newsletterTab.confirmations.send'))) return;

  sending.value = true;
  try {
    const imageUrl = newsletterImageFile.value ? await uploadNewsletterImage() : newsletter.value.imageUrl
    const response = await api.post('/admin/newsletter/send', {
      subject: newsletter.value.subject,
      content: newsletter.value.content,
      imageUrl: imageUrl || ''
    });
    
    alert(response.message || `Newsletter sent to ${response.count} subscribers!`);
    newsletter.value = { subject: '', content: '', imageUrl: '' };
    newsletterImageFile.value = null
    newsletterImagePreview.value = null
  } catch (err) {
    console.error('Failed to send newsletter', err);
    alert('Failed to send newsletter: ' + (err.response?.data?.message || err.message));
  } finally {
    sending.value = false;
  }
}




const openCreateInitiative = () => {
  isEditingInitiative.value = false
  editingInitiativeId.value = null
  newInitiative.value = {
    name: '',
    type: 'garden',
    description: '',
    contact: '',
    website: '',
    location: '',
    latitude: null,
    longitude: null
  }
  addressQuery.value = ''
  
  showCreateInitiative.value = true
  // Wait for DOM
  setTimeout(() => {
    initPickerMap()
  }, 100)
}

const openEditInitiative = (initiative) => {
  isEditingInitiative.value = true
  editingInitiativeId.value = initiative.id
  newInitiative.value = { ...initiative }
  addressQuery.value = initiative.location || ''
  
  showCreateInitiative.value = true
  setTimeout(() => {
    initPickerMap()
  }, 100)
}

const closeCreateInitiative = () => {
  showCreateInitiative.value = false
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

// Overijssel province center
const OVERIJSSEL_CENTER_LAT = 52.45
const OVERIJSSEL_CENTER_LNG = 6.5

const initPickerMap = () => {
  let lat = OVERIJSSEL_CENTER_LAT
  let lng = OVERIJSSEL_CENTER_LNG
  let zoom = 10

  // If editing and has coordinates, use them
  if (isEditingInitiative.value && newInitiative.value.latitude && newInitiative.value.longitude) {
    lat = newInitiative.value.latitude
    lng = newInitiative.value.longitude
    zoom = 13
  }

  if (map.value) {
      map.value.remove() // Clean up existing map instance if any (though usually destroyed on close)
  }

  map.value = L.map('picker-map').setView([lat, lng], zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  
  // Add initial marker if editing
  if (isEditingInitiative.value && newInitiative.value.latitude && newInitiative.value.longitude) {
     mapMarker.value = L.marker([lat, lng]).addTo(map.value)
     if (newInitiative.value.location) {
         mapMarker.value.bindPopup(newInitiative.value.location)
     }
  }

  // Click to place marker
  map.value.on('click', async (e) => {
    const { lat, lng } = e.latlng

    // Store real coordinates
    newInitiative.value.latitude = lat
    newInitiative.value.longitude = lng

    if (mapMarker.value) {
      mapMarker.value.setLatLng([lat, lng])
    } else {
      mapMarker.value = L.marker([lat, lng]).addTo(map.value)
    }

    // Reverse geocode to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
      const data = await response.json()

      if (data && data.display_name) {
        // Clean display name - remove non-Latin characters and extra commas
        const cleanDisplayName = data.display_name
          .replace(/[^\x00-\x7F,\s]/g, '') // Remove non-ASCII characters
          .replace(/,\s*,/g, ',') // Remove double commas
          .replace(/,\s*$/g, '') // Remove trailing comma
          .trim()

        // Auto-fill address input
        addressQuery.value = cleanDisplayName
        newInitiative.value.location = cleanDisplayName

        // Update marker popup
        if (mapMarker.value) {
          mapMarker.value.bindPopup(cleanDisplayName).openPopup()
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error', err)
      // Continue without error message as the coordinates are still set
    }
  })
}

const searchAddress = async () => {
  if (!addressQuery.value) return

  searchingAddress.value = true
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery.value)}&accept-language=en`)
    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      // Clean display name - remove non-Latin characters and extra commas
      const cleanDisplayName = display_name
        .replace(/[^\x00-\x7F,\s]/g, '') // Remove non-ASCII characters
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/,\s*$/g, '') // Remove trailing comma
        .trim()

      // Update Map
      if (map.value) {
        map.value.setView([latitude, longitude], 16)

        if (mapMarker.value) {
          mapMarker.value.setLatLng([latitude, longitude])
            .bindPopup(cleanDisplayName).openPopup()
        } else {
          mapMarker.value = L.marker([latitude, longitude]).addTo(map.value)
            .bindPopup(cleanDisplayName).openPopup()
        }
      }

      // Store real coordinates
      newInitiative.value.latitude = latitude
      newInitiative.value.longitude = longitude

      // Auto-fill address and location
      addressQuery.value = cleanDisplayName
      newInitiative.value.location = cleanDisplayName
    } else {
      useToastStore().error('Address not found')
    }
  } catch (err) {
    console.error('Geocoding error', err)
    useToastStore().error('Failed to search address')
  } finally {
    searchingAddress.value = false
  }
}

// Event map functions
const initEventMap = () => {
  const lat = 52.22153
  const lng = 6.89366
  const zoom = 13

  if (eventMap.value) {
    eventMap.value.remove()
  }

  eventMap.value = L.map('event-picker-map').setView([lat, lng], zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(eventMap.value)

  // Add click handler
  eventMap.value.on('click', async (e) => {
    const { lat, lng } = e.latlng

    if (eventMapMarker.value) {
      eventMapMarker.value.setLatLng([lat, lng])
    } else {
      eventMapMarker.value = L.marker([lat, lng]).addTo(eventMap.value)
    }

    // Reverse geocode to get address
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
      const data = await response.json()

      if (data && data.display_name) {
        const cleanDisplayName = data.display_name
          .replace(/[^\x00-\x7F,\s]/g, '')
          .replace(/,\s*,/g, ',')
          .replace(/,\s*$/g, '')
          .trim()

        eventAddressQuery.value = cleanDisplayName
        newEvent.value.location = cleanDisplayName

        if (eventMapMarker.value) {
          eventMapMarker.value.bindPopup(cleanDisplayName).openPopup()
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error', err)
    }
  })
}

const searchEventAddress = async () => {
  if (!eventAddressQuery.value) return

  searchingEventAddress.value = true
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(eventAddressQuery.value)}&accept-language=en`)
    const data = await response.json()

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      const cleanDisplayName = display_name
        .replace(/[^\x00-\x7F,\s]/g, '')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/g, '')
        .trim()

      if (eventMap.value) {
        eventMap.value.setView([latitude, longitude], 16)

        if (eventMapMarker.value) {
          eventMapMarker.value.setLatLng([latitude, longitude])
            .bindPopup(cleanDisplayName).openPopup()
        } else {
          eventMapMarker.value = L.marker([latitude, longitude]).addTo(eventMap.value)
            .bindPopup(cleanDisplayName).openPopup()
        }
      }

      newEvent.value.location = cleanDisplayName || eventAddressQuery.value
    } else {
      useToastStore().error('Address not found')
    }
  } catch (err) {
    console.error('Geocoding error', err)
    useToastStore().error('Failed to search address')
  } finally {
    searchingEventAddress.value = false
  }
}

const saveInitiative = async () => {
    // Validation
    if (!newInitiative.value.name.trim()) {
      useToastStore().error('Initiative name is required')
      return
    }
    if (!newInitiative.value.description.trim() || newInitiative.value.description.length < 10) {
      useToastStore().error('Description must be at least 10 characters')
      return
    }

    try {
      if (isEditingInitiative.value && editingInitiativeId.value) {
         await api.put(`/initiatives/${editingInitiativeId.value}`, newInitiative.value)
         useToastStore().success('Initiative updated successfully')
      } else {
         await api.post('/initiatives', newInitiative.value)
         useToastStore().success('Initiative created successfully')
      }
      showCreateInitiative.value = false
      setTimeout(() => load(), 500) // Refresh data
    } catch (err) {
      console.error('Failed to save initiative', err)
      useToastStore().error('Failed to save initiative')
    }
  }


const deleteInitiative = async (id) => {
  if (!confirm(t('admin.initiativesTab.confirmations.delete'))) return
  try {
    await api.delete(`/initiatives/${id}`)
    initiatives.value = initiatives.value.filter(i => i.id !== id)
  } catch (err) {
    console.error('Failed to delete initiative', err)
    alert('Failed to delete initiative')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: rgb(var(--color-background));
  padding: 1.5rem 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  padding: 0 2rem;
  position: relative;
  transition: grid-template-columns 0.3s ease;
}

.admin-container.sidebar-collapsed {
  grid-template-columns: 60px 1fr;
}

/* Sidebar Toggle */
.sidebar-toggle {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 50;
  background: rgb(var(--color-primary));
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(var(--color-primary), 0.4);
}

.sidebar-toggle:hover {
  background: rgb(var(--color-primary-dark));
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(var(--color-primary), 0.5);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.sidebar-collapsed .sidebar-toggle {
  left: 2rem;
}

/* Sidebar */
.admin-sidebar {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  height: calc(100vh - 3rem);
  position: sticky;
  top: 1.5rem;
  overflow-y: auto;
  transition: all 0.3s ease;
  border: 1px solid rgb(var(--color-border));
}

.sidebar-collapsed .admin-sidebar {
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
  width: 0;
}

.sidebar-header {
  margin-bottom: 1.5rem;
}

.sidebar-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.nav-item:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.nav-item.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

/* Content */
.admin-content {
  background: white;
  border-radius: 0.75rem;
  min-height: calc(100vh - 3rem);
  padding: 2rem;
  border: 1px solid rgb(var(--color-border));
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.panel-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  color: rgb(var(--color-text));
}

.panel-header p {
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.panel-header--sticky {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  margin: -2rem -2rem 0;
  padding: 2rem 2rem 1.25rem;
}

/* Content Tabs */
.content-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
}

.content-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 2rem;
  background: white;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.content-tab:hover {
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

.content-tab.active {
  background: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary));
  color: white;
}

.content-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.1);
  font-size: 0.75rem;
  font-weight: 600;
}

.content-tab.active .content-tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.content-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-input--wide {
  flex: 1;
  min-width: 300px;
}

.content-filter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 200px;
}

.content-filter select {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  color: rgb(var(--color-text));
}

.content-list {
  margin-top: 1rem;
}

/* Content Sections (Collapsible) */
.content-sections {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-section {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  overflow: hidden;
  background: white;
}

.content-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgb(var(--color-background));
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.content-section-header:hover {
  background: rgb(var(--color-border) / 0.5);
}

.section-chevron {
  color: rgb(var(--color-text-secondary));
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.section-chevron.expanded {
  transform: rotate(90deg);
}

.section-name {
  font-weight: 600;
  color: rgb(var(--color-text));
  flex: 1;
}

.section-count {
  font-size: 0.8125rem;
  color: rgb(var(--color-text-secondary));
  padding: 0.25rem 0.625rem;
  background: white;
  border-radius: 1rem;
}

.content-section-body {
  border-top: 1px solid rgb(var(--color-border));
}

.content-row--compact {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgb(var(--color-border));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-row--compact:last-child {
  border-bottom: none;
}

.content-row--compact .content-key {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.content-row--compact .content-key-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-text-secondary));
  font-family: monospace;
}

.format-select {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.content-locales {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.locale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.locale-header label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--color-text-secondary));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.link-btn--small {
  font-size: 0.75rem;
  padding: 0;
}

.content-row--compact .content-locale textarea {
  min-height: 60px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .content-locales {
    grid-template-columns: 1fr;
  }

  .content-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .content-tab {
    white-space: nowrap;
  }
}

.content-grid {
  display: grid;
  gap: 1.5rem;
}

.content-row {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 1rem;
  display: grid;
  gap: 1rem;
  background: rgb(var(--color-background));
}

.content-key {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.content-key-text {
  font-weight: 600;
  color: rgb(var(--color-text));
  word-break: break-word;
}

.content-format {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-format select {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  color: rgb(var(--color-text));
}

.content-locale {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-locale textarea {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 0.95rem;
  min-height: 90px;
  resize: vertical;
}

.link-btn {
  align-self: flex-start;
  background: none;
  border: none;
  color: rgb(var(--color-primary));
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: rgb(var(--color-text-secondary));
}

.empty-state h3 {
  font-size: 0.9375rem;
  font-weight: 500;
  margin-top: 1rem;
  color: rgb(var(--color-text-secondary));
}

.empty-state p {
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: white;
  border: 1px solid rgb(var(--color-border));
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users { background: #3b82f6; }
.stat-icon.events { background: #f59e0b; }
.stat-icon.groups { background: #8b5cf6; }
.stat-icon.initiatives { background: #10b981; }

.stat-info h3 {
  font-size: 0.8125rem;
  color: rgb(var(--color-text-secondary));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-top: 0.25rem;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-weight: 500;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: rgb(var(--color-text-secondary));
  border-bottom: 1px solid rgb(var(--color-border));
}

.data-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgb(var(--color-border));
  font-size: 0.9375rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgb(var(--color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-email {
  font-size: 0.8125rem;
  color: rgb(var(--color-text-secondary));
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.status-badge.suspended {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.status-badge.locked {
  background: rgba(249, 115, 22, 0.1);
  color: #c2410c;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  cursor: pointer;
  color: rgb(var(--color-text-secondary));
}

.action-btn:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fee2e2;
}

.action-btn.unlock:hover {
  background: #dbeafe;
  color: #2563eb;
  border-color: #dbeafe;
}

/* Forms */
.newsletter-form, .create-form {
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
}

.newsletter-form--fullpage {
  max-width: 100%;
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
}

.form-group--fullheight {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.textarea--fullheight {
  flex: 1;
  min-height: 400px;
  resize: vertical;
}

.admin-panel--fullpage {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 3rem);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.625rem;
  color: rgb(var(--color-text));
  font-size: 0.875rem;
}

input, textarea, select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  font-family: inherit;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.1);
}

input::placeholder, textarea::placeholder {
  color: rgb(var(--color-text-secondary));
  opacity: 0.6;
}

.form-actions, .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content--lg {
  max-width: 800px;
}

.modal-content--scrollable {
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.picker-map {
  width: 100%;
  height: 300px;
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  margin-top: 0.5rem;
  z-index: 10;
}

.picker-map--tall {
  height: 400px;
}

.role-select {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(var(--color-border));
  background: white;
  font-size: 0.875rem;
}

.help-text {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  margin-top: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge--garden {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.type-badge--market {
  background: rgba(234, 179, 8, 0.1);
  color: #a16207;
}

.type-badge--event {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.type-badge--group {
  background: rgba(168, 85, 247, 0.1);
  color: #7e22ce;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--color-text));
  letter-spacing: -0.025em;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  justify-content: center;
}

.btn--primary {
  background: rgb(var(--color-primary));
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn--primary:hover {
  background: rgb(var(--color-primary-dark));
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn--primary:active {
  transform: translateY(0);
}

.btn--outline {
  background: white;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text));
}

.btn--outline:hover {
  background: rgb(var(--color-background));
  border-color: rgb(var(--color-text-secondary));
}

.btn--ghost {
  background: transparent;
  color: rgb(var(--color-text-secondary));
}

.btn--ghost:hover {
  background: rgb(var(--color-background));
  color: rgb(var(--color-text));
}

.btn--danger {
  background: #ef4444;
  color: white;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}

.btn--danger:hover {
  background: #dc2626;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn--sm {
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
}

.admin-event-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.moderation-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: white;
}

.mod-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.mod-preview {
  color: rgb(var(--color-text-secondary));
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.mod-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgb(var(--color-text-secondary));
}

.polls-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 992px) {
  .polls-grid {
    grid-template-columns: 1fr 1.2fr;
  }
}

.poll-form-card {
  border: 1px solid rgb(var(--color-border));
  border-radius: 1rem;
  padding: 1.25rem;
  background: rgb(var(--color-background));
  display: grid;
  gap: 1rem;
}

.poll-option-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.poll-list {
  display: grid;
  gap: 1rem;
}

.poll-card {
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 1rem;
  background: white;
}

.poll-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.poll-card__header h3 {
  margin: 0.25rem 0;
}

.poll-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.poll-options-list {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.5rem;
}

.poll-option-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgb(var(--color-border));
}

.poll-option-row:last-child {
  border-bottom: none;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.75rem;
  width: fit-content;
}

.status-pill.active {
  background: rgba(var(--color-primary), 0.1);
  color: rgb(var(--color-primary));
}

.status-pill.inactive {
  background: #fef2f2;
  color: #b91c1c;
}

.checkbox-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox-row input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  order: 2;
}

.checkbox-row span {
  order: 1;
  flex: 1;
}

.vote-chip {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: rgb(var(--color-background));
  border-radius: 9999px;
  font-weight: 600;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .admin-page {
    padding: 1rem 0;
  }

  .admin-container {
    grid-template-columns: 1fr;
    padding: 0 1rem;
    gap: 1rem;
  }

  .admin-container.sidebar-collapsed {
    grid-template-columns: 1fr;
  }

  /* Mobile Sidebar - slides from top */
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 70vh;
    border-radius: 0 0 0.75rem 0.75rem;
    z-index: 100;
    transform: translateY(0);
    overflow-y: auto;
  }

  .sidebar-collapsed .admin-sidebar {
    transform: translateY(-100%);
    width: 100%;
  }

  /* Mobile Toggle Button */
  .sidebar-toggle {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    width: 3rem;
    height: 3rem;
    z-index: 101;
  }

  .sidebar-collapsed .sidebar-toggle {
    left: 1.5rem;
    bottom: 1.5rem;
  }

  /* Adjust content for mobile */
  .admin-content {
    min-height: auto;
    padding: 1.5rem;
    margin-top: 0;
  }

  .sidebar-collapsed .admin-content {
    margin-top: 0;
  }

  /* Keep nav vertical on mobile */
  .admin-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nav-item {
    width: 100%;
  }

  .admin-event-card, .moderation-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .event-actions, .mod-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .poll-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .poll-actions {
    justify-content: flex-start;
  }

  .polls-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-content--scrollable {
    max-height: 95vh;
  }

  .picker-map--tall {
    height: 300px;
  }
}

.file-upload-label {
  display: block;
  cursor: pointer;
  border: 2px dashed rgb(var(--color-border));
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.file-upload-label:hover {
  background: rgb(var(--color-background));
  border-color: rgb(var(--color-primary));
}

.upload-placeholder {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-text-secondary));
}

.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.file-input {
  display: none;
}

.remove-image {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 300px;
}

.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: rgb(var(--color-text-secondary));
  pointer-events: none;
}

.search-input input {
  padding-left: 2.5rem;
  width: 100%;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.category-card {
  background: white;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;
  position: relative;
  cursor: default;
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.drag-handle {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  cursor: grab;
  color: rgb(var(--color-text-muted));
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  opacity: 0;
}

.category-card:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgb(var(--color-text));
}

.drag-handle:active {
  cursor: grabbing;
}

.category-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.category-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 0.25rem;
}

.category-info p {
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Icon Picker */
.icon-picker-wrapper {
  position: relative;
}

.icon-preview-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.icon-preview-btn:hover {
  border-color: rgb(var(--color-primary));
}

.icon-preview {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.icon-search {
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid rgb(var(--color-border));
  font-size: 0.875rem;
}

.icon-search:focus {
  outline: none;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  gap: 0.5rem;
  padding: 1rem;
  overflow-y: auto;
}

.icon-option {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgb(var(--color-text));
}

.icon-option:hover {
  background: rgb(var(--color-background));
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

.icon-option--active {
  background: rgba(var(--color-primary), 0.1);
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-primary));
}

/* Color Picker */
.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
  gap: 0.5rem;
}

.color-preset {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preset:hover {
  transform: scale(1.1);
}

.color-preset--active {
  border-color: rgb(var(--color-text));
  box-shadow: 0 0 0 2px white, 0 0 0 4px currentColor;
}

.color-input {
  width: 100%;
  height: 3rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  cursor: pointer;
}

.color-text-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  font-family: monospace;
  text-transform: uppercase;
}

.help-text {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: rgb(var(--color-text-secondary));
}

/* Polls List Container */
.polls-list-container {
  display: grid;
  gap: 1.25rem;
}

.poll-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.badge--info {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.badge--success {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.poll-card__info .meta {
  font-size: 0.8125rem;
  color: rgb(var(--color-text-secondary));
  margin-top: 0.5rem;
}

/* Poll Modal Specific Styles */
.modal-content--poll {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-content--poll {
    max-width: 95vw;
    max-height: 85vh;
    padding: 1.5rem;
  }

  .polls-list-container {
    gap: 1rem;
  }

  .poll-card {
    padding: 1rem;
  }

  .poll-badges {
    margin-top: 0.5rem;
  }

  .poll-actions {
    width: 100%;
  }

  .poll-option-input {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .poll-option-input input {
    width: 100%;
  }

  .poll-option-input .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
