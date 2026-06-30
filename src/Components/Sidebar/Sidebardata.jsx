
// import HomeIcon from '@mui/icons-material/Home';
// import PersonIcon from '@mui/icons-material/Person';
// import Inventory2Icon from '@mui/icons-material/Inventory2';
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import ReorderIcon from '@mui/icons-material/Reorder';
// import HistoryIcon from '@mui/icons-material/History';
// import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
// import HealingIcon from '@mui/icons-material/FitnessCenter';
// import { FiClock } from "react-icons/fi";
// import { FaTag, FaTicketAlt, FaUsers } from "react-icons/fa";
// import { MdQuiz } from "react-icons/md";
// import { FaAppleAlt } from "react-icons/fa";
// import { HiUsers } from "react-icons/hi";
// import { IoSettingsOutline } from "react-icons/io5";
// import { TbReportAnalytics } from "react-icons/tb";
// import { FaUserInjured, FaStore, FaUserMd, FaUserShield } from "react-icons/fa";

// import { MdRestaurantMenu, MdSpa, MdCategory } from "react-icons/md";
// import { FaBoxOpen, FaTags } from "react-icons/fa";
// import { MdInventory } from "react-icons/md";
// import { FaChartLine, FaHeadset } from "react-icons/fa";
// import { FaClipboardList, FaHistory } from "react-icons/fa";
// import { FaCogs, FaDatabase, FaBoxes, FaHeartbeat, FaHospital } from "react-icons/fa";
// import { GiLotus } from "react-icons/gi";
// import { MdBrandingWatermark } from "react-icons/md";
// import { MdPhotoSizeSelectActual } from "react-icons/md";

// import RateReviewIcon from "@mui/icons-material/RateReview";
// import { MdReviews } from "react-icons/md";
// import { GiLotusFlower } from "react-icons/gi";
// import { FaListAlt } from "react-icons/fa";
// import { MdOndemandVideo } from "react-icons/md";


// import {
//   BiCategoryAlt,
//   BiPulse,
// } from "react-icons/bi";



// export const SidebarData = () => [

//   {
//     title: "Dashboard",
//     icon: <HomeIcon sx={{ fontSize: 20 }} />,
//     path: "/Dashboard",
//     permission: "view_dashboard",
//   },


//   // {
//   //   title: "Category Management",
//   //   icon: <ReorderIcon sx={{ fontSize: 20 }} />,
//   //   path: "#",
//   //   permission: "manage_orders",
//   //   children: [
//   //    {
//   //     title: "Service category",
//   //     path: "/main/category",
//   //     permission: "view_category",
//   //     icon: <FaClipboardList size={18} />
//   //   },

//   //    {
//   //     title: "Sub Service category",
//   //     path: "/main/productcategory",
//   //     permission: "view_product_category",
//   //     icon: <FaClipboardList size={18} />
//   //   },

//   //      {
//   //     title: "Sub-sub Service category",
//   //     path: "/main/subcategory",
//   //     permission: "view_product_category",
//   //     icon: <FaClipboardList size={18} />
//   //   },

//   //   ],
//   // },
//   {
//     title: "Category Management",
//     icon: <FaBoxes size={18} />,
//     path: "#",
//     permission: "manage_orders",
//     children: [
//       {
//         title: "Service Category",
//         path: "/main/category",
//         permission: "view_category",
//         icon: <FaClipboardList size={18} />
//       },

//       {
//         title: "Product Category",
//         path: "#",
//         permission: "view_product_category",
//         icon: <FaBoxOpen size={18} />,
//         children: [
//           {
//             title: " Product Category",
//             path: "/main/productcategory",
//             permission: "view_product_category",
//             icon: <FaTags size={18} />
//           },
//           {
//             title: " Sub Product Category",
//             path: "/main/subcategory",
//             permission: "view_product_category",
//             icon: <FaBoxes size={18} />
//           }
//         ]
//       },

//       {
//         title: "Health Category",
//         path: "#",
//         permission: "view_health_category",
//         icon: <FaHeartbeat size={18} />,
//         children: [
//           {
//             title: "Health Category",
//             path: "/category/healthcategory",
//             permission: "view_health_category",
//             icon: <FaHospital size={18} />
//           },
//           // {
//           //   title: "Health Sub Sub Category",
//           //   path: "/main/healthsubsubcategory",
//           //   permission: "view_health_category",
//           //   icon: <FaHeartbeat size={18} />
//           // }
//         ]
//       }
//     ]
//   },
//   {
//     title: "User Management",
//     icon: <HiUsers size={20} />,
//     path: "#",
//     // permission: "manage_users",
//     children: [
//       {
//         title: "Customers",
//         path: "/Customer",
//         permission:"view_customers",
//         icon: <FaUsers />
//       },
//       {
//         title: "Patients",
//         path: "/Patient",
//         permission:"view_patients",
//         icon: <FaUserInjured />
//       },
//       {
//         title: "Vendors",
//         path: "/Vendor",
//         permission: "view_vendors",
//         icon: <FaStore />
//       },
//       {
//         title: "Doctors",
//         path: "/Doctor",
//         permission: "view_doctors",
//         icon: <FaUserMd />
//       },
//       {
//         title: "Team Members",
//         path: "/Admin",
//         permission: "manage_admin",
//         icon: <FaUserShield />
//       }
//     ],
//   },


//   {
//     title: "Disease Management",
//     icon: <BiPulse size={20} />,
//     path: "#",
//     permission: "manage_disease",
//     children: [
//       {
//         title: "Disease",
//         path: "/disease",
//         permission: "view_disease",
//         icon: <BiCategoryAlt size={18} />,
//       },

//     ],
//   },


//   {
//     title: "Content Management",
//     icon: <MdCategory style={{ fontSize: 20 }} />,
//     path: "#",
//     permission: "manage_content",
//     children: [
//       {
//         title: "Questions",
//         icon: <MdQuiz style={{ fontSize: 20 }} />,
//         path: "#",
//         permission: "view_questions",
//         children: [
//           {
//             title: "Prakriti Questions",
//             icon: <MdQuiz style={{ fontSize: 18 }} />,
//             path: "/question/prakriti",
//             permission: "view_prakriti_questions",
//           },
//           {
//             title: "Medical Questions",
//             icon: <GiLotus style={{ fontSize: 18 }} />,
//             path: "/question/medical",
//             permission: "view_medical_questions",
//           },


//           {
//             title: "Prakirti-analysis",
//             icon: <MdQuiz style={{ fontSize: 18 }} />,
//             path: "/prakirti",
//             permission: "view_prakirti",
//           },

//         ],
//       },
//       {
//         title: "Diet Plans",
//         icon: <MdRestaurantMenu style={{ fontSize: 20 }} />,
//         path: "/Dietplans",
//         permission: "view_dietplans",
//       },
//       {
//         title: "Wellness Centers",
//         icon: <MdSpa style={{ fontSize: 20 }} />,
//         path: "/Wellnesscenter",
//         permission: "view_wellness_center",
//       },

//       {
//         title: "Banner Management",
//         icon: <MdPhotoSizeSelectActual style={{ fontSize: 18 }} />,
//         path: "/content/banner",
//         permission: "manage_banner",
//       },
//     ],
//   },

//   {
//     title: "Reviews Management",
//     icon: <RateReviewIcon sx={{ fontSize: 20 }} />,
//     path: "#",
//     permission: "manage_reviews",
//     children: [
//       {
//         title: "Product Reviews",
//         path: "/Review/Product",
//         permission: "view_Product_review",
//         icon: <MdReviews size={18} />
//       },
//       {
//         title: "Doctor Reviews",
//         path: "/Review/doctor",
//         permission: "view_doctor_review",
//         icon: <FaUserMd size={18} />
//       }
//     ]
//   },

//   {
//     title: "Products & Inventory",
//     icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
//     path: "#",
//     permission: "manage_inventory",
//     children: [
//       {
//         title: " Products Mangement",
//         path: "/Product",
//         permission: "view_products",
//         icon: <FaBoxOpen size={18} />
//       },
//       {
//         title: "Brand Name Mangement",
//         path: "/product/brandname",
//         permission: "manage_brand_name",
//         icon: <MdBrandingWatermark size={18} />
//       },
//       {
//         title: "Stock Management",
//         path: "/Product/Stock",
//         permission: "manage_stock",
//         icon: <MdInventory size={18} />
//       },
//     ],
//   },
// {
//   title: "Yoga Management",
//   icon: <GiLotusFlower size={20} />,
//   path: "#",
//   permission: "manage_yoga",
//   children: [
//     {
//       title: "Yoga Category",
//       path: "/yoga/category",
//       permission: "view_yoga_category",
//       icon: <FaListAlt size={18} />
//     },
//     {
//       title: "Yoga Sessions",
//       path: "/yoga/sessions",
//       permission: "view_yoga_sessions",
//       icon: <MdOndemandVideo size={18} />
//     }
//   ]
// },

//   {
//     title: "Order Management",
//     icon: <ReorderIcon sx={{ fontSize: 20 }} />,
//     path: "#",
//     permission: "manage_orders",
//     children: [
//       {
//         title: "Active Orders",
//         path: "/Order",
//         permission: "view_orders",
//         icon: <FaClipboardList size={18} />
//       },
//       {
//         title: "Order History",
//         path: "/History",
//         permission: "view_order_history",
//         icon: <FaHistory size={18} />
//       },
//     ],
//   },


//   {
//     title: "Reports & Analytics",
//     icon: <TbReportAnalytics size={20} />,
//     path: "#",
//     permission: "view_reports",
//     children: [
//       {
//         title: "Sales Report",
//         path: "/Reports/Sales",
//         permission: "view_sales_report",
//         icon: <FaChartLine size={18} />
//       },
//       {
//         title: "User Analytics",
//         path: "/Reports/Users",
//         permission: "view_user_analytics",
//         icon: <FaUsers size={18} />
//       },
//       {
//         title: "Product Performance",
//         path: "/Reports/Products",
//         permission: "view_product_performance",
//         icon: <FaBoxOpen size={18} />
//       },
//     ],
//   },


//   {
//     title: "Support Center",
//     icon: <FaTicketAlt size={20} />,
//     path: "/Support",
//     permission: "access_support",
//   },


//   {
//     title: "System Administration",
//     icon: <IoSettingsOutline size={20} />,
//     path: "#",
//     permission: "system_admin",
//     children: [
//       {
//         title: "Audit Logs",
//         path: "/Auditlogs",
//         permission: "view_audit_logs",
//         icon: <FaClipboardList size={18} />
//       },
//       {
//         title: "System Settings",
//         path: "/Settings",
//         permission: "manage_settings",
//         icon: <FaCogs size={18} />
//       },
//       {
//         title: "Role Management",
//         path: "/Roles",
//         permission: "manage_roles",
//         icon: <FaUserShield size={18} />
//       },
//       {
//         title: "Backup & Restore",
//         path: "/Backup",
//         permission: "manage_backup",
//         icon: <FaDatabase size={18} />
//       }
//     ],
//   },
// ];





// new one 

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReorderIcon from '@mui/icons-material/Reorder';
import HistoryIcon from '@mui/icons-material/History';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealingIcon from '@mui/icons-material/FitnessCenter';
import RateReviewIcon from "@mui/icons-material/RateReview";

import { FiClock } from "react-icons/fi";
import { FaTag, FaTicketAlt, FaUsers, FaClipboardList, FaHistory, FaCogs, FaDatabase, FaBoxes, FaHeartbeat, FaHospital } from "react-icons/fa";
import { MdQuiz, MdRestaurantMenu, MdSpa, MdCategory, MdInventory, MdBrandingWatermark, MdPhotoSizeSelectActual, MdReviews, MdOndemandVideo } from "react-icons/md";
import { FaAppleAlt, FaBoxOpen, FaTags, FaChartLine, FaHeadset, FaUserInjured, FaStore, FaUserMd, FaUserShield, FaListAlt } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { GiLotus, GiLotusFlower } from "react-icons/gi";
import { BiCategoryAlt, BiPulse } from "react-icons/bi";

export const SidebarData = () => [
  // ========== DASHBOARD ==========
  {
    title: "Dashboard",
    icon: <HomeIcon sx={{ fontSize: 20 }} />,
    path: "/Dashboard",
    permission: "view_dashboard",
  },

  // ========== CATEGORY MANAGEMENT ==========
  {
    title: "Category Management",
    icon: <MdCategory style={{ fontSize: 20 }} />,
    path: "#",
    permission: "manage_categories",
    children: [
      {
        title: "Service Category",
        path: "/main/category",
        permission: "view_service_category",
        icon: <BiCategoryAlt size={18} />
      },
      {
        title: "Product Categories",
        path: "#",
        permission: "view_product_categories",
        icon: <FaBoxOpen size={18} />,
        children: [
          {
            title: "Product Category",
            path: "/main/productcategory",
            permission: "view_product_category",
            icon: <FaTags size={18} />
          },
          {
            title: "Sub Product Category",
            path: "/main/subcategory",
            permission: "view_sub_product_category",
            icon: <FaBoxes size={18} />
          }
        ]
      },
      {
        title: "Health Categories",
        path: "#",
        permission: "view_health_categories",
        icon: <FaHeartbeat size={18} />,
        children: [
          {
            title: "Health Category",
            path: "/category/healthcategory",
            permission: "view_health_category",
            icon: <FaHospital size={18} />
          },
          {
            title: "Diseases",
            path: "/disease",
            permission: "view_disease",
            icon: <BiPulse size={18} />
          }
        ]
      }
    ]
  },

  // ========== USER MANAGEMENT ==========
  {
    title: "User Management",
    icon: <HiUsers size={20} />,
    path: "#",
    permission: "manage_users",
    children: [
      {
        title: "Customers",
        path: "/Customer",
        permission: "view_customers",
        icon: <FaUsers size={18} />
      },
      {
        title: "Patients",
        path: "/Patient",
        permission: "view_patients",
        icon: <FaUserInjured size={18} />
      },
      {
        title: "Vendors",
        path: "/Vendor",
        permission: "view_vendors",
        icon: <FaStore size={18} />
      },
      {
        title: "Doctors",
        path: "/Doctor",
        permission: "view_doctors",
        icon: <FaUserMd size={18} />
      },
      {
        title: "Team Members",
        path: "/Admin",
        permission: "manage_admin",
        icon: <FaUserShield size={18} />
      }
    ]
  },

  // ========== CONTENT MANAGEMENT ==========
  {
    title: "Content Management",
    icon: <MedicalServicesIcon sx={{ fontSize: 20 }} />,
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
            icon: <GiLotus style={{ fontSize: 18 }} />,
            path: "/question/prakriti",
            permission: "view_prakriti_questions",
          },
          {
            title: "Medical Questions",
            icon: <MedicalServicesIcon style={{ fontSize: 18 }} />,
            path: "/question/medical",
            permission: "view_medical_questions",
          },
          {
            title: "Prakriti Analysis",
            icon: <BiPulse style={{ fontSize: 18 }} />,
            path: "/prakirti",
            permission: "view_prakriti_analysis",
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
      {
        title: "Banner Management",
        icon: <MdPhotoSizeSelectActual style={{ fontSize: 18 }} />,
        path: "/content/banner",
        permission: "manage_banner",
      },
    ],
  },

  // ========== REVIEWS MANAGEMENT ==========
  {
    title: "Reviews Management",
    icon: <RateReviewIcon sx={{ fontSize: 20 }} />,
    path: "#",
    permission: "manage_reviews",
    children: [
      {
        title: "Product Reviews",
        path: "/Review/Product",
        permission: "view_product_review",
        icon: <MdReviews size={18} />
      },
      {
        title: "Doctor Reviews",
        path: "/Review/doctor",
        permission: "view_doctor_review",
        icon: <FaUserMd size={18} />
      }
    ]
  },

  // ========== PRODUCTS & INVENTORY ==========
  {
    title: "Products & Inventory",
    icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
    path: "#",
    permission: "manage_inventory",
    children: [
      {
        title: "Products Management",
        path: "/Product",
        permission: "view_products",
        icon: <FaBoxOpen size={18} />
      },
      {
        title: "Brand Management",
        path: "/product/brandname",
        permission: "manage_brand_name",
        icon: <MdBrandingWatermark size={18} />
      },
      {
        title: "Stock Management",
        path: "/Product/Stock",
        permission: "manage_stock",
        icon: <MdInventory size={18} />
      },
    ],
  },

  // ========== YOGA MANAGEMENT ==========
  {
    title: "Yoga Management",
    icon: <GiLotusFlower size={20} />,
    path: "#",
    permission: "manage_yoga",
    children: [
      {
        title: "Yoga Category",
        path: "/yoga/category",
        permission: "view_yoga_category",
        icon: <FaListAlt size={18} />
      },
      {
        title: "Yoga Sessions",
        path: "/yoga/sessions",
        permission: "view_yoga_sessions",
        icon: <MdOndemandVideo size={18} />
      }
    ]
  },

  // ========== ORDER MANAGEMENT ==========
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

  // ========== REPORTS & ANALYTICS ==========
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

  // ========== SUPPORT CENTER ==========
  {
    title: "Support Center",
    icon: <FaHeadset size={20} />,
    path: "/Support",
    permission: "access_support",
  },

  // ========== SYSTEM ADMINISTRATION ==========
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
    ]
  },
];