# DataTable Component

A reusable table component for displaying data in a consistent format across the application.

## Features

-  **Flexible Headers**: Configure column headers with custom widths, labels, and rendering functions
-  **Custom Rendering**: Use render functions for complex cell content
-  **Row Actions**: Add action buttons (edit, delete, etc.) to rows
-  **Loading State**: Built-in loading spinner
-  **Row Interactions**: Support for row clicks and hover effects
-  **Styling Options**: Configurable striped rows, compact mode, and custom classes
-  **Responsive**: Adapts to different screen sizes

## Props

| Prop                   | Type      | Default               | Description                                               |
| ---------------------- | --------- | --------------------- | --------------------------------------------------------- |
| `headers`              | Array     | `[]`                  | Array of header configuration objects                     |
| `data`                 | Array     | `[]`                  | Array of data objects to display                          |
| `onRowAction`          | Function  | -                     | Callback when action button is clicked                    |
| `actionLabel`          | String    | `"Edit"`              | Tooltip text for action button                            |
| `actionIcon`           | Component | -                     | React icon component for action button                    |
| `onSecondaryAction`    | Function  | -                     | Callback when secondary action button (delete) is clicked |
| `secondaryActionLabel` | String    | `"Delete"`            | Tooltip text for secondary action button                  |
| `secondaryActionIcon`  | Component | -                     | React icon component for secondary action button          |
| `noDataMessage`        | String    | `"No data available"` | Message shown when no data                                |
| `className`            | String    | `""`                  | Additional CSS classes                                    |
| `showActions`          | Boolean   | `true`                | Whether to show action column                             |
| `loading`              | Boolean   | `false`               | Show loading state                                        |
| `onRowClick`           | Function  | -                     | Callback when row is clicked                              |
| `striped`              | Boolean   | `true`                | Alternate row background colors                           |
| `hover`                | Boolean   | `true`                | Enable hover effects                                      |
| `compact`              | Boolean   | `false`               | Use smaller padding                                       |

## Header Configuration

Each header object can have:

```javascript
{
  key: "fieldName",           // Data field key
  label: "Display Name",      // Column header text
  className: "w-20",          // CSS classes for width/alignment
  width: "100px",             // Custom width (optional)
  render: (row, index) => {}  // Custom render function (optional)
}
```

## Usage Examples

### Basic Table

```jsx
import { DataTable } from "../components";
import { FiEdit2 } from "react-icons/fi";

const headers = [
   { key: "name", label: "Name", className: "flex-1" },
   { key: "email", label: "Email", className: "flex-1" },
   { key: "status", label: "Status", className: "w-20" },
];

const data = [
   { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
   { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
];

<DataTable
   headers={headers}
   data={data}
   onRowAction={(row) => console.log("Edit:", row)}
   actionIcon={FiEdit2}
   actionLabel="Edit User"
/>;
```

### Custom Rendering

```jsx
const headers = [
   {
      key: "name",
      label: "Product",
      className: "flex-1",
      render: (product) => (
         <div className="flex items-center gap-2">
            <img src={product.image} className="w-8 h-8 rounded" />
            <span>{product.name}</span>
         </div>
      ),
   },
   {
      key: "price",
      label: "Price",
      className: "w-24",
      render: (product) => `$${product.price.toFixed(2)}`,
   },
];
```

### With Row Actions and Click Handler

```jsx
<DataTable
   headers={headers}
   data={data}
   onRowAction={handleEdit}
   onRowClick={handleRowClick}
   actionIcon={FiEdit2}
   loading={isLoading}
   noDataMessage="No products found"
   striped={true}
   hover={true}
/>
```

### Products Table (Current Implementation)

The Products component uses this DataTable with the following configuration:

```jsx
const tableHeaders = [
   {
      key: "name",
      label: "Name",
      className: "flex-5 whitespace-nowrap",
      render: (product) => (
         <div className="flex items-center gap-1">
            {product.name}
            {product.label && (
               <span className="text-gray-400">({product.label})</span>
            )}
            <StatusIndicator status={product.status} />
         </div>
      ),
   },
   {
      key: "category",
      label: "Category",
      className: "flex-2 whitespace-nowrap",
      render: (product) => getCategoryName(product.category_id),
   },
   // ... more headers
];

<DataTable
   headers={tableHeaders}
   data={tableData}
   onRowAction={handleTableRowAction}
   actionIcon={FiEdit2}
   actionLabel="Edit Product"
   noDataMessage="No products"
   loading={loading}
/>;
```

## Styling

The component uses Tailwind CSS classes and follows the application's dark theme:

-  **Background**: `bg-gray-800/70` with rounded corners
-  **Header**: Gradient background `from-gray-900/80 to-gray-800/80`
-  **Rows**: Border separation with hover effects
-  **Text**: White for primary content, gray variants for secondary

## Accessibility

-  Action buttons include `title` attributes for tooltips
-  Keyboard navigation support through standard button/click handlers
-  Semantic HTML structure with proper contrast ratios

## Best Practices

1. **Use descriptive header labels** that clearly indicate the data type
2. **Implement custom render functions** for complex data formatting
3. **Handle loading states** to improve user experience
4. **Provide meaningful action labels** for accessibility
5. **Use consistent width classes** for proper column alignment
6. **Handle empty states** with appropriate messages
