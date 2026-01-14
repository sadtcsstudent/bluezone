@echo off
echo Seeding production database...
echo.
set DATABASE_URL=postgresql://db_xy19_user:BeAdok708blFzJ0LUOCSSXYJxVn4u232@dpg-d5jqla2li9vc73bl6m2g-a.virginia-postgres.render.com/db_xy19
npx ts-node seed-all.ts
echo.
echo Done!
pause
