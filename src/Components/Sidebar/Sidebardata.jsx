

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

export const SidebarData = () => [
  {
    title: "Dashboard",
    icon: <HomeIcon sx={{ fontSize: 20 }} />,
    path: "/Dashboard",
    permission: "view_dashboard",
  },
  {
    title: "Customer",
    icon: <PersonIcon sx={{ fontSize: 20 }} />,
    path: "/Customer",
    permission: "view_customers",
  },
  {
    title: "Product",
    icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
    path: "/Product",
    permission: "view_products",
  },
  {
    title: "Vendor",
    icon: <StorefrontIcon sx={{ fontSize: 20 }} />,
    path: "/Vendor",
    permission: "view_vendors",
  },
  {
    title: "Team",
    icon: <FaUsers size={20} />,
    path: "/Admin",
    permission: "manage_admin",
  },
  {
    title: "Order",
    icon: <ReorderIcon sx={{ fontSize: 20 }} />,
    path: "/Order",
    permission: "view_orders",
  },
  {
    title: "Doctor",
    icon: <MedicalServicesIcon sx={{ fontSize: 20 }} />,
    path: "/Doctor",
    permission: "view_doctors",
  },
  {
    title: "History",
    icon: <HistoryIcon sx={{ fontSize: 20 }} />,
    path: "/History",
    permission: "view_order_history",
  },
  {
    title: "Wellness Center",
    icon: <HealingIcon sx={{ fontSize: 20 }} />,
    path: "/Wellnesscenter",
    permission: "view_wellness_center",
  },
  {
    title: "Patient",
    icon: <PersonIcon sx={{ fontSize: 20 }} />,
    path: "/Patient",
    permission: "view_patients",
  },
  {
    title: "Support",
    icon: <FaTicketAlt size={20} />,
    path: "/Support",
    permission: "access_support",
  },
  {
    title: "Audit Logs",
    icon: <FiClock size={20} />,
    path: "/Auditlogs",
    permission: "view_audit_logs",
  },
];

