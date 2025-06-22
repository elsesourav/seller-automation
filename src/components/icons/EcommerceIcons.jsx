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

// Setup Icon - Modern gear design
export const SetupIcon = ({ className }) => (
   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle
         cx="12"
         cy="12"
         r="3"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
      <path
         d="M12 1v3m0 16v3m11-9h-3M4.2 12H1m17.66-7.07l-2.12 2.12M7.46 16.95l-2.12 2.12m12.02-.01l-2.12-2.12M7.46 7.05L5.34 4.93"
         stroke="currentColor"
         strokeWidth="2"
         fill="none"
      />
   </svg>
);
