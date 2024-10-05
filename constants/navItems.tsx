export interface NavItem {
    id: string; 
    label: string;
    active: boolean;
    href?: string;
    subItems?: NavItem[];
  }
  
  export const navItems: NavItem[] = [
    {
      id: "collections", 
      label: "📦 Collections",
      active: false,
      subItems: [
        {
          id: "question-bank", 
          label: "📋 Question Bank",
          active: false,
          href: "/superadmin/collections/questionbank",
        },
        {
          id: "collection",
          label: "📦 Collection",
          active: false,
          href: "/superadmin/collections/collection",
        },
      ],
    },
    {
      id: "snippets",
      label: "📦 Snippets",
      active: false,
      subItems: [
        {
          id: "snippet-bank",
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/snippets",
        },
        {
          id: "snippet-set",
          label: "📦 Snippet Set",
          active: false,
          href: "/superadmin/snippets/snippetset",
        },
      ],
    },
    {
      id: "overview-snippets",
      label: "📦 Overview Snippets",
      active: false,
      subItems: [
        {
          id: "overview-snippet-bank",
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/overviewsnippets",
        },
        {
          id: "overview-snippet-set",
          label: "📦 Snippet Set",
          active: false,
          href: "/superadmin/overviewsnippets/overviewsnippetset",
        },
      ],
    },
    { id: "company", label: "🏢 Company", active: false, href: "/superadmin" },
    { id: "analytics", label: "📊 Analytics", active: false, href: "/superadmin/analytics" },
  ];
  