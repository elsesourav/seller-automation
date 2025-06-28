import {
   HiClipboardCheck,
   HiClipboardList,
   HiCube,
   HiDocumentText,
   HiInformationCircle,
   HiViewGrid,
} from "react-icons/hi";

export const ProductIcon = (props) => <HiCube {...props} />;
export const BasicInfoIcon = (props) => <HiInformationCircle {...props} />;
export const DescriptionIcon = (props) => <HiDocumentText {...props} />;
export const InfoFormIcon = (props) => <HiClipboardList {...props} />;
export const DescFormIcon = (props) => <HiClipboardCheck {...props} />;
export const VerticalIcon = (props) => <HiViewGrid {...props} />;
