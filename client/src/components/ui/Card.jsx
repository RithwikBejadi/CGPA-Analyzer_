import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-100/50 transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-xl:shadow-2xl:shadow-black/30 hover:scale-[1.01] cursor-pointer' : '';
  const paddingStyles = padding ? 'p-6' : '';
  const shadowStyles = 'shadow-md';

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 }
  } : {};

  return (
    <Component
      className={`${baseStyles} ${shadowStyles} ${hoverStyles} ${paddingStyles} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
