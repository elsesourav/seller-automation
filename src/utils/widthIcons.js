import {
   FourthWidthIcon,
   FullWidthIcon,
   HalfWidthIcon,
   ThreeFourthsWidthIcon,
} from "../components/icons/WidthIcons";

// Width Icons Map for easy access
export const WidthIcons = {
   full: FullWidthIcon,
   "three-fourths": ThreeFourthsWidthIcon,
   half: HalfWidthIcon,
   fourth: FourthWidthIcon,
};

// Get Width Icon Component
export const getWidthIcon = (width, className) => {
   const IconComponent = WidthIcons[width] || FullWidthIcon;
   return IconComponent({ className });
};
