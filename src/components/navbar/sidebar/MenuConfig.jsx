import { 
  FaUserCheck, FaTags, FaBoxOpen, FaFolderOpen, FaBuilding, 
  FaClipboardList, FaUsersCog, FaUserTag, FaUserPlus 
} from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";

export const menuADM = [
  { label: "Dashboard", icon: LuLayoutDashboard, path: "/" },

  { label: "Aprovar Acessos", icon: FaUserCheck, path: "/solicitacoes-acesso" },
  { label: "Aprovar Setores", icon: FaUserTag, path: "/adm/solicitacoes-setor" },
  { label: "Gerenciar Usuários", icon: FaUsersCog, path: "/adm/usuarios" },
  { label: "Competências", icon: FaClipboardList, path: "/adm/competencias" },
  { label: "Classificações", icon: FaTags, path: "/adm/classificacoes" },
  { label: "Itens", icon: FaBoxOpen, path: "/adm/itens" },
  { label: "Kits", icon: FaFolderOpen, path: "/adm/combos" },
  { label: "Estruturas", icon: FaBuilding, path: "/adm/estruturas" },
];


export const menuResponsavel = [
  { label: "Dashboard", icon: LuLayoutDashboard, path: "/" },
  { label: "Preencher Combos", icon: FaClipboardList, path: "/responsavel-setor/preenchimento" },
  { label: "Solicitar Setor", icon: FaUserPlus, path: "/solicitar-setor" },
];
