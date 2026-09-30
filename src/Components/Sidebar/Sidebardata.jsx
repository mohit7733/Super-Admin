

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReorderIcon from '@mui/icons-material/Reorder';
import HistoryIcon from '@mui/icons-material/History';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealingIcon from '@mui/icons-material/FitnessCenter';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { FaFileContract } from 'react-icons/fa';
import { FaGift } from 'react-icons/fa6';
import {FaSyncAlt} from 'react-icons/fa';
import {FaMoneyBillWave} from 'react-icons/fa';
import { MdInventory2 } from "react-icons/md";
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";



import { FiClock } from "react-icons/fi";
import { FaTag, FaTicketAlt, FaUsers, FaClipboardList,FaCogs, FaDatabase, FaBoxes, FaHeartbeat, FaHospital, FaBriefcaseMedical, FaCalendarCheck ,} from "react-icons/fa";
import { MdQuiz, MdCategory,MdBrandingWatermark, MdPhotoSizeSelectActual, MdReviews, MdOndemandVideo, MdCardMembership, MdEventAvailable, MdEvent } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaBoxOpen, FaTags, FaChartLine, FaHeadset, FaUserInjured, FaStore, FaUserMd,FaListAlt } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { GiLotus, GiLotusFlower } from "react-icons/gi";
import { BiCategoryAlt, BiPulse } from "react-icons/bi";
import { MdAdminPanelSettings } from "react-icons/md";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { MdReceiptLong } from "react-icons/md";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { GiMeal } from "react-icons/gi";

import { BiPlusCircle } from "react-icons/bi";
import { FiUploadCloud } from "react-icons/fi";
import {FaCapsules}  from  "react-icons/fa";
import {FaFileAlt}  from  "react-icons/fa";



export const SidebarData = () => [

  {
    title: "Dashboard",
    icon: <HomeIcon sx={{ fontSize: 20 }} />,
    path: "/Dashboard",
    permission: "view_dashboard",
  },

 
  
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
  {
  title: "Brand Management",
  icon: <BrandingWatermarkIcon sx={{ fontSize: 20 }} />,
  path: "#",
  permission: "manage_brands",
  children: [
    {
      
        title: "Brand Management",
        path: "/product/brandname",
        permission: "manage_brand_name",
        icon: <MdBrandingWatermark size={18} />
     
    },
  ],
},
 {
  title: "Coupons & Reward",
  path: "#",
  permission: "view_coupons",
  icon: <FaTicketAlt size={18} />,
  children: [
    {
      title: "Coupons",
      path: "/coupons",
      permission: "view_coupons",
      icon: <FaTicketAlt size={18} />
    },
     {
      title: "Reward",
      path: "/reward",
      permission: "view_reward",
      icon: <FaGift size={18} />
    }
  
  ]
},
// {
//   title: "Manage Subscriptions",
//   icon: <MdCardMembership size={20} />,
//   path: "/subscription/packages",
//   permission: "manage_subscription_packages",
// },
  {
  title: "FAQ",
  icon: <FaCircleQuestion size={18} />,
  path: "#",
  permission: "view_faq",
  children: [
    {
      title: "FAQ Management",
      path: "/FAQ/Management",
      permission: "view_faq",
      icon: <FaCircleQuestion size={18} />,
    },
  ],
},
{
  title: "Legal Policies",
  icon: <FaFileContract size={20} />,
  path: "#",
  permission: "manage_legal_policies",
  children: [
    {
      title: "Legal",
      icon: <FaFileAlt size={16} />,
      path: "/LegalPolicies",
      permission: "manage_legal_policies",
    },
  ],
},
 
  {
    title: "User Management",
    icon: <HiUsers size={20} />,
    path: "#",
    permission: "manage_users",
    children: [
     
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
      }
   
    ],
  },

{
  title: "Management",
  icon: <FaBriefcaseMedical size={18} />,
  path: "#",
  permission: "view_mangement",
  children: [
    {
      title: "Consultation History",
      path: "/Mangement/History",
      permission: "view_cancellation_request",
     icon: <FaSyncAlt size={12} />,
    },
    {
      title: "Cancellation Request",
      path: "/Magement/Appointment",
      permission: "view_cancellation_request",
      icon: <FaCalendarCheck size={12} />,
    },
    {
    title: "Reschedule Request",
      path: "/Management/Reschedule",
      permission: "view_reschudle_request",
     icon: <FaSyncAlt size={12} />,
    },
    
    {
  title: "Medicine Approval",
  path: "/Magement/MedicineApproval",
  permission: "view_medicine_approval",
  icon: <FaCapsules size={18} />,
},
  ],
},


{
  title: "Packages",
  icon: <ShoppingCartIcon sx={{ fontSize: 20 }} />,
  path: "#",
  permission: "manage_packages",
  children: [
    {
      title: "Package Management",
      icon: <MdInventory2 style={{ fontSize: 20 }} />,
      path: "/packages",
      permission: "manage_packages",
    },
    {
      title: "Package Category",
      icon: <MdCategory style={{ fontSize: 20 }} />,
      path: "/package-category",
      permission: "manage_packages",
    },
  ],
},

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
        title: "Banner Management",
        icon: <MdPhotoSizeSelectActual style={{ fontSize: 18 }} />,
        path: "/content/banner",
        permission: "manage_banner",
      },
       {
        title: "Banner Events",
        icon: <MdPhotoSizeSelectActual style={{ fontSize: 18 }} />,
        path: "/content/bannerEvent",
        permission: "manage_banner",
      },
      // {
      //   title: "Event Banner Management",
      //   icon: <MdEvent style={{ fontSize: 18 }} />,
      //   path: "/content/eventbanner",
      //   permission: "manage_event_banner",
      // }

    ],
  },
{
   title: "Unicommerce ",
icon: <ShoppingCartIcon sx={{ fontSize: 20 }} />,
  path: "#",
  permission: "manage_ecommerce",
  children: [
    {
      title: "Tax Class",
      icon: <MdReceiptLong style={{ fontSize: 20 }} />,
      path: "/tax-class",
      permission: "manage_tax_class",
    },
    // {
    //   title: "Tax Rates",
    //   icon: <MdPercent style={{ fontSize: 20 }} />,
    //   path: "/tax-rates",
    //   permission: "manage_tax_rates",
    // },
  ],
},
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
      },
      {
  title: "Diet Reviews",
  path: "/Review/Diet",
  permission: "view_diet_review",
  icon: <MdReviews size={18} />
},

    ]
  },

  {
    title: "Admin Management",
 
icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />,
    path: "#",
    
    children: [
      {
        title: "Add Roles",
        path: "/admin/role",
        permission: "view_role",
        icon: <MdReviews size={18} />
      },
     {
        title: "Add Admin",
        path: "/Admin",
        permission: "manage_admin",
     icon: <MdAdminPanelSettings size={18} />
      }
    ]
  },


  
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
      // {
      //   title: "Brand Management",
      //   path: "/product/brandname",
      //   permission: "manage_brand_name",
      //   icon: <MdBrandingWatermark size={18} />
      // },
       {
      title: "Bulk Upload",
      path: "/admin/bulk-upload-products",
      permission: "manage_product_bulk",
      icon: <FiUploadCloud size={18} />
    },
      // {
      //   title: "Stock Management",
      //   path: "/Product/Stock",
      //   permission: "manage_stock",
      //   icon: <MdInventory size={18} />
      // },
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


  {
  title: "Diet Management",
  icon: <GiMeal size={20} />,
  path: "#",
  permission: "manage_diet",
  children: [
    {
      title: "All Diet Plans",
      path: "/diet/all",
      permission: "view_diet_plans",
      icon: <FaListAlt size={18} />
    },
    {
      title: "Add Diet Plan",
      path: "/diet/add",
      permission: "add_diet_plan",
      icon: <BiPlusCircle size={18} />
    },
    // {
    //   title: "Diet Categories",
    //   path: "/diet/categories",
    //   permission: "view_diet_categories",
    //   icon: <MdOutlineRestaurantMenu size={18} />
    // }
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
      title: "Order History",
      path: "/ActiveOrder",
      permission: "view_orders",
      icon: <FaClipboardList size={18} />
    },
    {
      title: "Consultation Refund Requests",
      path: "/Order/ConsultationRefundRequests",
      permission: "view_consultation_refund",
      icon: <FaMoneyBillWave size={18} />
    },
  ],
},

  // ========== REPORTS & ANALYTICS ==========
  // {
  //   title: "Reports & Analytics",
  //   icon: <TbReportAnalytics size={20} />,
  //   path: "#",
  //   permission: "view_reports",
  //   children: [
  //     {
  //       title: "Sales Report",
  //       path: "/Reports/Sales",
  //       permission: "view_sales_report",
  //       icon: <FaChartLine size={18} />
  //     },
  //     {
  //       title: "User Analytics",
  //       path: "/Reports/Users",
  //       permission: "view_user_analytics",
  //       icon: <FaUsers size={18} />
  //     },
  //     {
  //       title: "Product Performance",
  //       path: "/Reports/Products",
  //       permission: "view_product_performance",
  //       icon: <FaBoxOpen size={18} />
  //     },
  //   ],
  // },

  
  // {
  //   title: "Support Center",
  //   icon: <FaHeadset size={20} />,
  //   path: "/Support",
  //   permission: "access_support",
  // },

  // {
  //   title: "System Administration",
  //   icon: <IoSettingsOutline size={20} />,
  //   path: "#",
  //   permission: "system_admin",
  //   children: [
  //     {
  //       title: "Audit Logs",
  //       path: "/Auditlogs",
  //       permission: "view_audit_logs",
  //       icon: <FaClipboardList size={18} />
  //     },
  //     {
  //       title: "System Settings",
  //       path: "/Settings",
  //       permission: "manage_settings",
  //       icon: <FaCogs size={18} />
  //     },
  //     // {
  //     //   title: "Role Management",
  //     //   path: "/Roles",
  //     //   permission: "manage_roles",
  //     //   icon: <FaUserShield size={18} />
  //     // },
  //     {
  //       title: "Backup & Restore",
  //       path: "/Backup",
  //       permission: "manage_backup",
  //       icon: <FaDatabase size={18} />
  //     }
  //   ]
  // },
];