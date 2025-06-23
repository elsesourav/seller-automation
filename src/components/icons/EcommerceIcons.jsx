// Custom SVG Icons for E-commerce Seller Functions

// Home Icon - Clean house design
export const HomeIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
         d="M12 3l8 6v10a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1V9l8-6z"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
   </svg>
);

// Product Mapping Icon - Product with arrows showing duplication
export const MappingIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect
         x="4"
         y="8"
         width="6"
         height="8"
         rx="1"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />

      <path d="M10 10l4 0" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
         d="M12 8l2 2-2 2"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />

      <path d="M10 14l4 0" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
         d="M12 12l2 2-2 2"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />

      <rect
         x="16"
         y="6"
         width="4"
         height="4"
         rx="0.5"
         stroke="currentColor"
         strokeWidth="1.5"
         fill="none"
      />
      <rect
         x="16"
         y="14"
         width="4"
         height="4"
         rx="0.5"
         stroke="currentColor"
         strokeWidth="1.5"
         fill="none"
      />
   </svg>
);

// Create Listing Icon - Document with plus
export const ListingIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
         d="M7 3h10l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
      <path d="M17 3v4h4" stroke="currentColor" strokeWidth="2" fill="none" />

      <path d="M12 10v6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 13h6" stroke="currentColor" strokeWidth="2" fill="none" />
   </svg>
);

// Update Products Icon - Document with edit pen
export const UpdateIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
         d="M7 3h8l4 4v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
      <path d="M15 3v4h4" stroke="currentColor" strokeWidth="2" fill="none" />

      <path
         d="M10 12l6-6 2 2-6 6H10v-2z"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
      <path d="M16 6l2 2" stroke="currentColor" strokeWidth="2" fill="none" />
   </svg>
);

// Setup Icon - Settings/Configuration design
export const SetupIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      {/* Settings gear */}
      <circle
         cx="12"
         cy="12"
         r="3"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
      <path
         d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
   </svg>
);
