import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReorderIcon from '@mui/icons-material/Reorder';
import HistoryIcon from '@mui/icons-material/History';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HealingIcon from '@mui/icons-material/FitnessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
// import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { FaTicketAlt } from "react-icons/fa";

<FaTicketAlt />


export const SidebarData = () => [
  {
    title: "Dashboard",
    icon: <HomeIcon sx={{ fontSize: 20 }} />,
    path: "/Dashboard",
  },

  {
    title: "Customer ",
    icon: <PersonIcon sx={{ fontSize: 20 }}/>,
    path: "/Customer",
  },
 
  {
    title:"Product",
    icon:<Inventory2Icon sx={{ fontSize: 20 }}/>,
    path:"/Product",

  },
  {
    title:"vendors",
    icon:<StorefrontIcon sx={{ fontSize: 20 }}/>,
    path:"/Vendors",

  },
  {
    title:"Order",
    icon:<ReorderIcon sx={{ fontSize: 20 }}/>,
    path:"/Order",

  },
   {
    title:"Doctor",
    icon:<MedicalServicesIcon sx={{ fontSize: 20 }}/>,
    path:"/Doctor",

  },
   
   {
    title:"History",
    icon:<HistoryIcon sx={{ fontSize:20}}/>,
    path:"/History",

  },
   {
    title:" wellnesscenter",
    icon:<HealingIcon sx={{ fontSize:20}}/>,
    path:"/Center",

  },
   {
    title:" Booking",
    icon:<EventAvailableIcon sx={{ fontSize:20}}/>,
    path:"/Booking",

  },
  {
    title:" patient",
    icon: <PersonIcon sx={{ fontSize: 20 }}/>,
    path:"/Allpatient",

  },
  {
    title:" Support",
    icon: < FaTicketAlt sx={{ fontSize: 20 }}/>,
    path:"/Support",

  },

];


