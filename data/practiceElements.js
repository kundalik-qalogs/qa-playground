/**
 * Canonical ordered list of practice elements.
 * Used by:
 *  - app/(Practice)/practice/_components/PracticeClientContent.jsx  (practice hub grid)
 *  - app/(Practice)/practice/_components/PracticeNavCards.jsx        (prev/next nav)
 *
 * slug  — matches the route /practice/[slug] and componentMapping in [slug]/page.jsx
 * logo  — path inside /public/mainicons/
 * isPracticeSlug — false for entries that link outside /practice (e.g. Bank Demo)
 */
export const practiceElements = [
  {
    title: "Input Fields",
    slug: "input-fields",
    logo: "/mainicons/edit.svg",
    description: "Interact with different types of input fields",
    footerTitle: "Practice Now",
  },
  {
    title: "Buttons",
    slug: "buttons",
    logo: "/mainicons/buttons.svg",
    description: "Click, double-click, right-click, and disabled buttons",
    footerTitle: "Practice Now",
  },
  {
    title: "Forms",
    slug: "forms",
    logo: "/mainicons/sign-form.svg",
    description: "Fill and submit forms with validation scenarios",
    footerTitle: "Practice Now",
  },
  {
    title: "Dropdowns",
    slug: "dropdowns",
    logo: "/mainicons/select.svg",
    description: "Handle single and multi-option dropdown selections",
    footerTitle: "Practice Now",
  },
  {
    title: "Data Table",
    slug: "data-table",
    logo: "/mainicons/simtable.svg",
    description: "Practice reading, sorting, and filtering table data",
    footerTitle: "Practice Now",
  },
  {
    title: "Alerts & Dialogs",
    slug: "alerts-dialogs",
    logo: "/mainicons/alert.svg",
    description: "Handle browser alerts, confirms, and prompt dialogs",
    footerTitle: "Practice Now",
  },
  {
    title: "Radio & Checkbox",
    slug: "radio-checkbox",
    logo: "/mainicons/radio.svg",
    description: "Toggle radio buttons and checkboxes in different states",
    footerTitle: "Practice Now",
  },
  {
    title: "Date Picker",
    slug: "date-picker",
    logo: "/mainicons/calendar.svg",
    description: "Interact with date pickers and time selection elements",
    footerTitle: "Practice Now",
  },
  {
    title: "Links",
    slug: "links",
    logo: "/mainicons/edit.svg",
    description: "Interact with different types of links and navigation",
    footerTitle: "Practice Now",
  },
  {
    title: "Tabs & Windows",
    slug: "tabs-windows",
    logo: "/mainicons/window.svg",
    description: "Switch between browser tabs and pop-up windows",
    footerTitle: "Practice Now",
  },
  {
    title: "Dynamic Waits",
    slug: "dynamic-waits",
    logo: "/mainicons/waits.svg",
    description: "Practice explicit and implicit waits for dynamic content",
    footerTitle: "Practice Now",
  },
  {
    title: "Multi Select",
    slug: "multi-select",
    logo: "/mainicons/selectable.svg",
    description: "Practice selecting multiple items from lists and dropdowns",
    footerTitle: "Practice Now",
  },
  {
    title: "mDocks.dev",
    slug: null,
    cardId: "mdocks-dev",
    logo: "/mainicons/selectable.svg",
    description: "View Markdown files beautifully with a clean reader experience",
    footerTitle: "Open mDocks.dev",
    externalLink: "https://mdocks.dev",
  },
  {
    title: "File Upload",
    slug: "file-upload",
    logo: "/mainicons/download.svg",
    description: "Practice file upload and download automation scenarios",
    footerTitle: "Practice Now",
  },
  // Bank Demo is intentionally last and excluded from prev/next nav (not a /practice/[slug] route)
  {
    title: "Bank App",
    slug: null,
    logo: "/mainicons/edit.svg",
    description: "End-to-end POM practice with a realistic bank demo app",
    footerTitle: "Start Practice",
    externalLink: "/bank",
    isBankDemo: true,
  },
];

/** Elements that have a /practice/[slug] route — used for prev/next navigation */
export const practiceNavElements = practiceElements.filter((el) => el.slug);
