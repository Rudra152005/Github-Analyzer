import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivityData } from '../../types';

interface ContributionHeatmapProps {
  data: ActivityData[];
}

export default function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const cells = data || [];

  if (cells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-text-muted dark:text-text-dark-muted">
        <span className="text-sm">No activity records found</span>
      </div>
    );
  }

  // Calculate day-of-week cell padding timezone-safely based on the starting date
  const firstCellDate = new Date(cells[0].date);
  const firstDayOfWeek = firstCellDate.getDay();

  const paddedCells: (ActivityData | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...cells,
  ];

  const weeksArray: (ActivityData | null)[][] = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeksArray.push(paddedCells.slice(i, i + 7));
  }

  const maxContributions = Math.max(...cells.map(c => c.count), 1);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-light-border dark:bg-dark-border hover:bg-light-border/80 dark:hover:bg-dark-border/80';
    if (count <= maxContributions * 0.25) return 'bg-accent-primary/20 hover:bg-accent-primary/30';
    if (count <= maxContributions * 0.5) return 'bg-accent-primary/45 hover:bg-accent-primary/55';
    if (count <= maxContributions * 0.75) return 'bg-accent-primary/75 hover:bg-accent-primary/85';
    return 'bg-accent-primary hover:bg-accent-primary/90';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative w-full min-w-0">
      <div className="flex gap-1 items-start w-full">
        {/* Days of Week Labels */}
        <div className="flex flex-col gap-1 mr-2 text-[10px] text-text-muted dark:text-text-dark-muted select-none pt-0.5">
          {days.map((day, i) => (
            <div key={day} className="h-3 flex items-center justify-end font-medium">
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Grid scrollable container */}
        <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-2 w-full min-w-0">
          {weeksArray.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
              {week.map((cell, dayIndex) => (
                cell ? (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-[2px] ${getColorClass(cell.count)} cursor-pointer transition-colors hover:ring-2 hover:ring-accent-primary hover:ring-offset-1 hover:ring-offset-light-surface dark:hover:ring-offset-dark-card`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentElement = e.currentTarget.offsetParent;
                      if (parentElement) {
                        const parentRect = parentElement.getBoundingClientRect();
                        setHoveredCell({
                          date: cell.date,
                          count: cell.count,
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(0.2, (weekIndex * 7 + dayIndex) * 0.0005) }}
                  />
                ) : (
                  <div key={`${weekIndex}-${dayIndex}`} className="w-3 h-3" />
                )
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tooltip positioned dynamic relative to hovered cell */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              left: `${hoveredCell.x}px`,
              top: `${hoveredCell.y}px`,
              transform: 'translate(-50%, -130%)',
            }}
            className="bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded px-2.5 py-1 text-xs text-text-primary dark:text-white shadow-xl z-50 pointer-events-none whitespace-nowrap font-medium"
          >
            <span className="font-semibold text-accent-primary">{hoveredCell.count} commits</span>
            <span className="text-text-muted dark:text-text-dark-muted ml-1">on {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
