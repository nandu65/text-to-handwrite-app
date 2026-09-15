# Handwrite Studio — Text to Handwritten Document Generator

A fast, client-side handwriting document generator that turns typed text into realistic handwritten notes, letters, and assignments in real time.

![Handwrite Studio Preview](https://raw.githubusercontent.com/placeholder/handwrite-studio.png)

## ✨ Features

- 📝 **Live Text to Handwriting**: Instant real-time conversion from typed or pasted text to natural handwriting.
- 📄 **Multiple Page Types**:
  - **Ruled Paper**: Crisp notebook ruled lines with optional red left margin rule.
  - **Graph Paper**: Clean mathematical grid lines.
  - **Blank Paper**: Unlined parchment sheets.
- 📐 **True Physical Page Sizes**:
  - **A4** (210 × 297 mm)
  - **A5** (148 × 210 mm)
  - **Letter** (8.5 × 11 in)
- ✍️ **Handwriting Customization**:
  - Multiple handwriting font styles (*Caveat*, *Shadows Into Light*, *Indie Flower*, *Patrick Hand*, *Kalam*, *Dancing Script*, *Homemade Apple*).
  - Adjustable handwriting size (px) and line-spacing multipliers.
  - Multiple ink colors (Ballpoint Blue, Royal Blue, Classic Dark Ink, Gel Black, Fountain Brown, Teacher Red, Emerald Green, + Custom Color Picker).
  - Subtle character jitter toggle for organic, non-uniform natural feel.
- 🔄 **Automatic Multi-Page Flow**: Seamlessly calculates printable area and automatically wraps and paginates long text across multiple pages.
- 🖼️ **High-Resolution PNG Export**: Generates 2x high-DPI crystal-clear PNG images for each page.
- 📑 **Exact-Dimension PDF Export**: Uses client-side vector/canvas rendering to create authentic physical-sized PDFs matching selected standards (A4, A5, Letter).
- 🔍 **Interactive Preview & Zoom**: Scalable viewport with zoom-in, zoom-out, and auto-fit to screen.
- 🔮 **"Create My Handwriting" Pipeline Placeholder**: Concept modal outlining the planned 5-stage personal handwriting profile & custom glyph engine.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) or [Deno](https://deno.land/) (v2+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/text-to-handwrite-app.git

# Navigate to project folder
cd text-to-handwrite-app

# Install dependencies
npm install
# or if using deno:
# deno install
```

### Development

```bash
npm run dev
# or
# deno task dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

---

## 🛠️ Tech Stack

- **React 18** with **TypeScript**
- **Vite**
- **Tailwind CSS**
- **jsPDF** (client-side PDF generation)
- **html2canvas** (high-res page rasterization)
- **Lucide React** (icons)
- **Google Fonts** (curated handwriting typography)

---

## 📄 License

MIT License. Feel free to use and adapt!
