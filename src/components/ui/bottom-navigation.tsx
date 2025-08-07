'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Camera, 
  Pill, 
  User 
} from 'lucide-react';

interface TabItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const tabs: TabItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Pill, label: 'Medications', href: '/medications' },
  { icon: Camera, label: 'Scan', href: '/scan' },
  { icon: User, label: 'Account', href: '/account' }
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 shadow-lg">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center p-3 min-w-[70px] min-h-[70px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl touch-feedback"
              aria-label={tab.label}
            >
              <motion.div
                className="flex flex-col items-center"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-1 bg-primary/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Icon */}
                <div className="relative z-10">
                  <Icon 
                    size={24} 
                    className={`transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                    strokeWidth={2}
                  />
                  
                  {/* Badge */}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-amber-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.div>
                  )}
                </div>
                
                {/* Label */}
                <span 
                  className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;