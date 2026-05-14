// import HomeIcon from '@mui/icons-material/Home';
// import PersonIcon from '@mui/icons-material/Person';
// import Inventory2Icon from '@mui/icons-material/Inventory2';
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import ReorderIcon from '@mui/icons-material/Reorder';
// import HistoryIcon from '@mui/icons-material/History';
// import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
// import HealingIcon from '@mui/icons-material/FitnessCenter';
// import { FiClock } from "react-icons/fi";
// import { FaTicketAlt, FaUsers } from "react-icons/fa";
// import { MdQuiz } from "react-icons/md";
// import { FaAppleAlt } from "react-icons/fa";
// import { HiUsers } from "react-icons/hi";
// import { TbReportAnalytics } from "react-icons/tb";

// export const SidebarData = () => [
//   // SECTION 1: DASHBOARD
//   {
//     title: "Dashboard",
//     icon: <HomeIcon sx={{ fontSize: 20 }} />,
//     path: "/Dashboard",
//     permission: "view_dashboard",
//     section: "Overview",
//     order: 1,
//   },

//   // SECTION 2: USER MANAGEMENT
//   {
//     title: "Customers",
//     icon: <PersonIcon sx={{ fontSize: 20 }} />,
//     path: "/Customer",
//     permission: "view_customers",
//     section: "User Management",
//     order: 2,
//   },
//   {
//     title: "Patients",
//     icon: <PersonIcon sx={{ fontSize: 20 }} />,
//     path: "/Patient",
//     permission: "view_patients",
//     section: "User Management",
//     order: 3,
//   },
//   {
//     title: "Vendors",
//     icon: <StorefrontIcon sx={{ fontSize: 20 }} />,
//     path: "/Vendor",
//     permission: "view_vendors",
//     section: "User Management",
//     order: 4,
//   },
//   {
//     title: "Doctors",
//     icon: <MedicalServicesIcon sx={{ fontSize: 20 }} />,
//     path: "/Doctor",
//     permission: "view_doctors",
//     section: "User Management",
//     order: 5,
//   },
//   {
//     title: "Team",
//     icon: <FaUsers size={20} />,
//     path: "/Admin",
//     permission: "manage_admin",
//     section: "User Management",
//     order: 6,
//   },

//   // SECTION 3: CONTENT
//   {
//     title: "Prakriti Questions",
//     icon: <MdQuiz sx={{ fontSize: 20 }} />,
//     path: "/question/prakriti",
//     permission: "view_prakriti_questions",
//     section: "Content Management",
//     order: 7,
//   },
//   {
//     title: "Medical Questions",
//     icon: <MdQuiz sx={{ fontSize: 20 }} />,
//     path: "/question/medical",
//     permission: "view_medical_questions",
//     section: "Content Management",
//     order: 8,
//   },
//   {
//     title: "Diet Plans",
//     icon: <FaAppleAlt sx={{ fontSize: 20 }} />,
//     path: "/Dietplans",
//     permission: "view_dietplans",
//     section: "Content Management",
//     order: 9,
//   },
//   {
//     title: "Wellness Centers",
//     icon: <HealingIcon sx={{ fontSize: 20 }} />,
//     path: "/Wellnesscenter",
//     permission: "view_wellness_center",
//     section: "Content Management",
//     order: 10,
//   },

//   // SECTION 4: PRODUCTS & ORDERS
//   {
//     title: "Products",
//     icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
//     path: "/Product",
//     permission: "view_products",
//     section: "Commerce",
//     order: 11,
//   },
//   {
//     title: "Orders",
//     icon: <ReorderIcon sx={{ fontSize: 20 }} />,
//     path: "/Order",
//     permission: "view_orders",
//     section: "Commerce",
//     order: 12,
//   },
//   {
//     title: "Order History",
//     icon: <HistoryIcon sx={{ fontSize: 20 }} />,
//     path: "/History",
//     permission: "view_order_history",
//     section: "Commerce",
//     order: 13,
//   },

//   // SECTION 5: REPORTS
//   {
//     title: "Reports & Analytics",
//     icon: <TbReportAnalytics size={20} />,
//     path: "/Reports",
//     permission: "view_reports",
//     section: "Insights",
//     order: 14,
//   },

//   // SECTION 6: SUPPORT & SYSTEM
//   {
//     title: "Support",
//     icon: <FaTicketAlt size={20} />,
//     path: "/Support",
//     permission: "access_support",
//     section: "Support",
//     order: 15,
//   },
//   {
//     title: "Audit Logs",
//     icon: <FiClock size={20} />,
//     path: "/Auditlogs",
//     permission: "view_audit_logs",
//     section: "System",
//     order: 16,
//   },
// ];

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReorderIcon from '@mui/icons-material/Reorder';
import HistoryIcon from '@mui/icons-material/History';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealingIcon from '@mui/icons-material/FitnessCenter';
import { FiClock } from "react-icons/fi";
import { FaTicketAlt, FaUsers } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { FaAppleAlt } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import {  FaUserInjured, FaStore, FaUserMd, FaUserShield } from "react-icons/fa";

import {  MdRestaurantMenu, MdSpa, MdCategory } from "react-icons/md";
import { FaBoxOpen, FaTags } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import { FaChartLine,  FaHeadset } from "react-icons/fa";
import { FaClipboardList, FaHistory } from "react-icons/fa";
import {  FaCogs,  FaDatabase } from "react-icons/fa";


export const SidebarData = () => [
  
  {
    title: "Dashboard",
    icon: <HomeIcon sx={{ fontSize: 20 }} />,
    path: "/Dashboard",
    permission: "view_dashboard",
  },

 
  {
    title: "User Management",
    icon: <HiUsers size={20} />,
    path: "#",
    // permission: "manage_users",
    children: [
      {
    title: "Customers",
    path: "/Customer",
    permission: "view_customers",
    icon: <FaUsers />
  },
  {
    title: "Patients",
    path: "/Patient",
    permission: "view_patients",
    icon: <FaUserInjured />
  },
  {
    title: "Vendors",
    path: "/Vendor",
    permission: "view_vendors",
    icon: <FaStore />
  },
  {
    title: "Doctors",
    path: "/Doctor",
    permission: "view_doctors",
    icon: <FaUserMd />
  },
  {
    title: "Team Members",
    path: "/Admin",
    permission: "manage_admin",
    icon: <FaUserShield />
  }
    ],
  },

  {
  title: "Content Management",
  icon: <MdCategory style={{ fontSize: 20 }} />, 
  path: "#",
  permission: "manage_content",
  children: [
    {
      title: "Questions",
      icon: <MdQuiz style={{ fontSize: 20 }} />,
      path: "#",
      permission: "view_questions",
      children: [
        {
          title: "Prakriti Questions",
          icon: <MdQuiz style={{ fontSize: 18 }} />,
          path: "/question/prakriti",
          permission: "view_prakriti_questions",
        },
        {
          title: "Medical Questions",
          icon: <MdQuiz style={{ fontSize: 18 }} />,
          path: "/question/medical",
          permission: "view_medical_questions",
        },
      ],
    },
    {
      title: "Diet Plans",
      icon: <MdRestaurantMenu style={{ fontSize: 20 }} />,
      path: "/Dietplans",
      permission: "view_dietplans",
    },
    {
      title: "Wellness Centers",
      icon: <MdSpa style={{ fontSize: 20 }} />,
      path: "/Wellnesscenter",
      permission: "view_wellness_center",
    },
  ],
},
 
  {
    title: "Products & Inventory",
    icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
    path: "#",
    permission: "manage_inventory",
    children: [
      {
      title: "All Products",
      path: "/Product",
      permission: "view_products",
      icon: <FaBoxOpen size={18} />
    },
    {
      title: "Categories",
      path: "/Product/Categories",
      permission: "view_categories",
      icon: <FaTags size={18} />
    },
    {
      title: "Stock Management",
      path: "/Product/Stock",
      permission: "manage_stock",
      icon: <MdInventory size={18} />
    },
    ],
  },

 
  {
    title: "Order Management",
    icon: <ReorderIcon sx={{ fontSize: 20 }} />,
    path: "#",
    permission: "manage_orders",
    children: [
     {
      title: "Active Orders",
      path: "/Order",
      permission: "view_orders",
      icon: <FaClipboardList size={18} />
    },
    {
      title: "Order History",
      path: "/History",
      permission: "view_order_history",
      icon: <FaHistory size={18} />
    },
    ],
  },

  
  {
    title: "Reports & Analytics",
    icon: <TbReportAnalytics size={20} />,
    path: "#",
    permission: "view_reports",
    children: [
      {
      title: "Sales Report",
      path: "/Reports/Sales",
      permission: "view_sales_report",
      icon: <FaChartLine size={18} />
    },
    {
      title: "User Analytics",
      path: "/Reports/Users",
      permission: "view_user_analytics",
      icon: <FaUsers size={18} />
    },
    {
      title: "Product Performance",
      path: "/Reports/Products",
      permission: "view_product_performance",
      icon: <FaBoxOpen size={18} />
    },
    ],
  },


  {
    title: "Support Center",
    icon: <FaTicketAlt size={20} />,
    path: "/Support",
    permission: "access_support",
  },


  {
    title: "System Administration",
    icon: <IoSettingsOutline size={20} />,
    path: "#",
    permission: "system_admin",
    children: [
     {
  title: "Audit Logs",
  path: "/Auditlogs",
  permission: "view_audit_logs",
  icon: <FaClipboardList size={18} />
},
{
  title: "System Settings",
  path: "/Settings",
  permission: "manage_settings",
  icon: <FaCogs size={18} />
},
{
  title: "Role Management",
  path: "/Roles",
  permission: "manage_roles",
  icon: <FaUserShield size={18} />
},
{
  title: "Backup & Restore",
  path: "/Backup",
  permission: "manage_backup",
  icon: <FaDatabase size={18} />
}
    ],
  },
];