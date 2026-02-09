# JSON to Excel Converter

A modern, high-performance web application for converting JSON files to Excel spreadsheets with real-time visualization and editing capabilities.

## 📋 Overview

JSON to Excel Converter is a React-based tool that allows users to import JSON files and instantly view them in both JSON and spreadsheet formats side-by-side. The application provides an intuitive interface for data transformation, making it easy to convert complex JSON structures into Excel workbooks with multiple sheets.

## ✨ Features

- **📁 JSON Import**: Drag and drop or browse to import JSON files
- **👁️ Dual View**: Simultaneous JSON and spreadsheet visualization
- **📊 Multiple Sheets**: Automatic conversion of nested JSON to multiple Excel sheets
- **⚡ Real-time Processing**: Progress tracking for large file imports
- **🔍 Data Table View**: Interactive spreadsheet display with proper formatting
- **💾 Excel Export**: Download converted data as `.xlsx` files
- **🎨 Modern UI**: Clean, responsive interface with dark mode styling
- **⚙️ Memory Efficient**: Stream-based file reading for handling large files
- **🚀 Fast Performance**: Lazy loading and code splitting for optimal load times

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4 + DaisyUI
- **Excel Processing**: SheetJS (xlsx)
- **JSON Visualization**: react-json-view
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useTransition, useCallback)
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd json2excel
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🚀 Usage

1. **Import JSON File**:
   - Click the "Import JSON" button or drag and drop a JSON file
   - Supported formats: `.json` files with object or array structures

2. **View Data**:
   - Left panel: JSON editor with syntax highlighting
   - Right panel: Spreadsheet view with tabs for multiple sheets

3. **Export to Excel**:
   - Click the "Export to Excel" button to download the converted file
   - The file will maintain the structure with multiple sheets if applicable

## 📁 Project Structure

```
json2excel/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── action-button/    # Export/action controls
│   │   ├── data-table/       # Spreadsheet table view
│   │   ├── json-import/      # File import component
│   │   ├── json-viewer/      # JSON visualization
│   │   ├── sheet-tab/        # Sheet navigation tabs
│   │   └── sheet-view/       # Main sheet display
│   ├── hooks/           # Custom React hooks
│   │   └── useImportJson.ts  # Core JSON import logic
│   ├── icons/           # Custom icon components
│   ├── lib/             # Utility functions
│   ├── pages/           # Route pages
│   │   └── Home/        # Main application page
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Application entry point
│   └── route.ts         # Route configuration
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## 🎯 Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run ESLint
pnpm lint
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite for fast development and optimized production builds. Configuration can be modified in `vite.config.ts`.

### TypeScript Configuration

TypeScript settings are split across:

- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - Application code configuration
- `tsconfig.node.json` - Node/build tools configuration

### Tailwind CSS

Tailwind configuration is enhanced with DaisyUI components. Customize themes and styles in your Tailwind setup.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [SheetJS](https://sheetjs.com/) for Excel file processing
- [React JSON View](https://github.com/mac-s-g/react-json-view) for JSON visualization
- [Vite](https://vitejs.dev/) for the incredible build tool
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
