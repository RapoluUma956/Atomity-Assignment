# Atomity Assignment

This is my submission for the Atomity frontend assignment.

I built a simple cloud dashboard where users can explore resource usage and costs in an interactive way. The main idea is to let users start from a high-level overview and then drill down step by step to see more detailed information.

### Deployment Link: https://atomity-assignment-six.vercel.app/

## Feature Chosen

The app has 3 levels:

1. **Overview**
   - Shows overall resource usage (CPU, RAM, GPU, PV, Network, Cloud)
   - Displayed using a bar chart

2. **Platform Level**
   - Selecting a platform (AWS, Azure, etc.) shows its nodes

3. **Node Insights**
   - Clicking a node shows:
     - usage vs requested resources
     - estimated savings
     - optimization suggestions

I chose this feature because it mirrors real-world cloud infrastructure workflows, where users move from overall metrics to detailed optimization insights.

---

## Animation

- Forward navigation → panel slides from right  
- Back navigation → panel slides from left  
- Date/platform change → chart fades in  

Animations are implemented using CSS keyframes.

---
## Styling & Theme

- Used **CSS variables (tokens)** for colors and spacing  
- Dark mode is default, with light mode toggle  
- Theme switching is done by adding/removing a `light` class on `<html>`  

---

## Charts

- Built using **Recharts**  
- Used components like `<BarChart>`, `<Bar>`, `<Tooltip>` to create interactive charts  
- Supports hover effects and drill-down interactions  

---

## Data Handling

- Data is fetched and used to generate chart values  
- Implemented basic caching to avoid repeated API calls  
- If fetching fails, fallback data is used so the UI still works  
- Chart data is generated in a consistent way for each date range  

---

## Libraries Used

- React  
- TypeScript  
- Vite  
- Recharts  
- Tailwind CSS

---

## What I Would Improve With More Time

- **Real backend integration**  
  Replace mock/generated data with real API data to reflect actual cloud usage and cost metrics.

- **Smoother animations**  
  Improve transitions by synchronizing chart and panel animations for a more seamless experience.

- **Advanced filtering**  
  Add filters like cluster, namespace, or cost range to help users narrow down specific data quickly.

- **Responsive design**  
  Optimize layout for mobile and tablet screens by adjusting sidebar and chart structure.

- **Better loading states**  
  Add detailed skeleton loaders for charts and panels to improve perceived performance.

  ---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```


---

## Project Structure

```
src/
├── components/
│   ├── DrillChart.tsx      # Bar chart with overview → nodes drill-down, breadcrumb nav
│   ├── Header.tsx          # Date range picker + dark/light theme toggle
│   ├── InsightsPanel.tsx   # Node-level metrics, savings highlight, optimizations table
│   └── Sidebar.tsx         # Cloud platform selector (AWS, Azure, GCP, On-Prem)
├── hooks/
│   └── useData.ts          # Cache Storage API fetch hook with stale-while-expired logic
├── App.tsx                 # Root state, animation direction, panel routing
├── data.ts                 # Seeded RNG data generators, in-memory memoization
├── tokens.ts               # TypeScript token object wrapping CSS custom properties
├── tokens.css              # CSS variables (dark + light themes), keyframes, base reset
└── main.tsx                # Entry point
```

---
