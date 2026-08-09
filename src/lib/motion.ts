export const springSidebar = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const sectionEntrance = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const cardLift = {
  whileHover: { y: -8, scale: 1.02 },
};
