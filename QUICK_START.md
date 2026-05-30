# 🚀 QUICK START & COMMANDS

## Get Started in 30 Seconds

```bash
cd "/home/nihal/Desktop/do it/trading-intelligence-system"
npm run dev
```

Then open: **http://localhost:3000**

---

## 💻 Essential Commands

### Development
```bash
# Start dev server (Loads at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check code quality
npm run lint

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Database
```bash
# Create a new migration
npx prisma migrate dev

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Format database schema
npx prisma format

# Generate Prisma Client
npx prisma generate
```

### Database Backup
```bash
# Backup database
cp database/trading_system.db backups/backup_$(date +%Y%m%d_%H%M%S).db

# Restore from backup
cp backups/backup_[date].db database/trading_system.db
```

---

## 📍 Navigation

| Page | Route | Keyboard |
|------|-------|----------|
| Dashboard | `/` | Home |
| Weekly Planner | `/weekly-planner` | Plan |
| Daily Tasks | `/daily-tasks` | Tasks |
| Trades | `/trades` | Trades |
| Diary | `/diary` | Journal |
| Learning | `/learning` | Learn |
| Media Library | `/media` | Movies |
| Analytics | `/analytics` | Charts |
| Settings | `/settings` | Config |

---

## 🎯 Feature Highlights

### Dashboard
- Overview of all metrics
- Today's progress at a glance
- Quick stats and summaries
- Link to all features

### Weekly Planner
- Set weekly focus
- Create learning roadmap
- Track recommended media
- Weekly goal management

### Daily Tasks
- Add/complete tasks
- Filter by category
- Adjust priority
- Track time spent
- See daily completion rate

### Trading Journal
- Log new trades
- Track P&L
- Record strategy
- Note emotional state
- Calculate win rate

### Diary Entries
- Write reflections
- Track mood (1-10)
- Monitor confidence
- Log stress levels
- View emotional trends

### Learning Progress
- Topic-based tracking
- Progress per topic
- View all lessons
- Track completion
- See proficiency levels

### Media Library
- Track movies/books
- Rate content (1-5 stars)
- Write reviews
- Record lessons learned
- Track impact on mindset

### Analytics
- Win rate trends
- Discipline breakdown
- Emotional patterns
- Learning consistency
- Performance insights

### Settings
- Create backups
- Export data
- Database info
- App version
- Privacy info

---

## 📊 Pre-loaded Sample Data

The app comes with realistic trading data:

### Trades
- AAPL swing trade: +$27.00
- TSLA swing trade: -$17.50
- MSFT swing trade: +$68.00

**Sample Win Rate**: 66%

### Daily Tasks
- 5 tasks with different categories
- Mixed completion status
- Various priority levels

### Movies
- The Big Short (5/5 stars)
- Margin Call (4/5 stars)
- The Wolf of Wall Street (watching)
- Moneyball (unwatched)
- Inside Job (unwatched)

### Diary Entries
- 2 sample entries
- Mood/confidence/stress tracking
- Emotional insights

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `/src/styles/globals.css` or modify Tailwind classes in components:
```tsx
// Blue accent
className="bg-blue-600"

// Green success
className="text-green-400"

// Red danger
className="text-red-400"
```

### Add New Page
1. Create file in `/src/app/[name]/page.tsx`
2. Add route to sidebar in `/src/components/layout/Sidebar.tsx`
3. Create feature module in `/src/modules/`

### Update Database
Edit `/prisma/schema.prisma` then:
```bash
npx prisma migrate dev --name [migration_name]
```

### Replace Mock Data
Edit `/src/lib/mock/data.ts` with your own data

---

## 🐛 Common Issues & Fixes

### Server won't start
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database error
```bash
# Reset database
rm database/trading_system.db
npx prisma migrate dev --name init
```

### Old node_modules
```bash
# Clean install
npm ci --legacy-peer-deps
```

---

## 📈 Data Management

### Backup Your Data
1. Go to Settings page
2. Click "Create Backup" 
3. File saved to `/backups/`

### Restore Backup
1. Go to Settings
2. Upload backup file
3. Click "Restore"

### Export Data
1. Settings page
2. Select format (CSV/JSON/Excel)
3. Download data

---

## 🔍 File Structure Reference

```
trading-intelligence-system/
├── src/
│   ├── app/               # Pages (routing)
│   │   ├── page.tsx       # Home
│   │   ├── layout.tsx     # Root layout
│   │   ├── analytics/
│   │   ├── daily-tasks/
│   │   ├── diary/
│   │   ├── learning/
│   │   ├── media/
│   │   ├── settings/
│   │   ├── trades/
│   │   └── weekly-planner/
│   │
│   ├── components/        # Reusable components
│   │   └── layout/
│   │       ├── RootLayoutContent.tsx
│   │       ├── Sidebar.tsx
│   │       └── TopNav.tsx
│   │
│   ├── modules/          # Feature modules
│   │   └── dashboard/
│   │       ├── Dashboard.tsx
│   │       ├── Analytics.tsx
│   │       ├── DailyTasks.tsx
│   │       ├── Diary.tsx
│   │       ├── Learning.tsx
│   │       ├── Media.tsx
│   │       ├── Settings.tsx
│   │       ├── Trades.tsx
│   │       └── WeeklyPlanner.tsx
│   │
│   ├── lib/              # Utilities
│   │   ├── mock/
│   │   │   └── data.ts   # Sample data
│   │   └── utils/
│   │       └── formatting.ts
│   │
│   └── styles/
│       └── globals.css   # Global styles
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── database/
│   └── trading_system.db # SQLite database
│
└── package.json
```

---

## ⚡ Performance Tips

- **First Load**: ~800ms to "Ready"
- **Local Data**: No network latency
- **Offline**: Works completely without internet
- **SQLite**: Fast local queries
- **Dark Theme**: Less battery on OLED screens

---

## 🔐 Security Tips

✅ Always backup before making changes
✅ Keep backup files in multiple locations
✅ Don't share database file
✅ Use strong OS password protection
✅ Regular backups of your data

---

## 📚 Learning Resources

Built-in movie recommendations:
- **The Big Short** - Market understanding
- **Margin Call** - Risk management  
- **Wolf of Wall Street** - Psychology insights
- **Moneyball** - Data-driven approach
- **Inside Job** - System understanding

Track them in the Media Library!

---

## 🎯 Daily Workflow Suggestion

1. **Morning** - Review dashboard, check daily tasks
2. **During Trading** - Log each trade immediately
3. **After Trading** - Update diary with emotions and learnings
4. **Evening** - Review analytics, update progress
5. **Weekly** - Review weekly plan, adjust next week's focus

---

## 💡 Pro Tips

- Use categories to organize tasks
- Tag trades with strategy names
- Rate media honestly (helps with insights)
- Journal daily (even if just a sentence)
- Review analytics weekly (see patterns)
- Backup after major updates
- Track emotional state consistently

---

## 🚀 Ready to Trade!

Your system is live and ready to help you:
✅ Track your trades
✅ Grow your skills
✅ Improve psychology
✅ Build discipline
✅ Stay organized
✅ Learn consistently

**Start with:** `npm run dev`

---

*Last Updated: May 23, 2026*
*Version: 1.0.0*
*Status: Ready to Use*
