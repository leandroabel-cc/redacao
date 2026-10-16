/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  Building2, 
  Briefcase, 
  Users, 
  History, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Activity,
  UserCircle,
  X,
  Filter,
  ArrowRightLeft,
  FileText,
  UserMinus,
  Calendar,
  Layers,
  MapPin,
  Flag,
  FileCheck,
  AlertCircle,
  Trash2,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ArrowUpDown,
  Info,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data ---

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'orgaos', label: 'Gestão de Órgãos', icon: Building2 },
  { id: 'cadastros', label: 'Cadastros Gerais', icon: Flag },
  { id: 'areas', label: 'Áreas e Cargos', icon: Briefcase },
  { id: 'nomeacoes', label: 'Nomeações Ativas', icon: Users },
  { id: 'auditoria', label: 'Trilha de Auditoria', icon: History },
  { id: 'config', label: 'Configurações API', icon: Settings },
];


interface Organ {
  id: string;
  descricao: string;
  sigla: string;
  tipo: string;
  sequencia: string;
}

interface Municipio {
  id: string;
  descricao: string;
}

interface TipoOrgao {
  id: string;
  descricao: string;
}

interface Area {
  id: string;
  descricao: string;
  sigla: string;
  idOrgao: string;
}

interface Cargo {
  id: string;
  descricao: string;
  sigla: string;
  idArea: string;
  idOrgao?: string;
  gestor: boolean;
}

const CARGOS = ['Diretor', 'Gerente', 'Assessor Técnico', 'Coordenador', 'Superintendente'];
const STATUSES = ['Publicado', 'Aguardando DOE', 'Em Análise', 'Exonerado'];
const NIVEIS = ['Especial', 'I', 'II', 'III'];

const NOMINATIONS = [
  { id: '1', name: 'João Alberto Mendes', registration: '99422-1', organ: 'SES - Saúde', area: 'Gestão Hospitalar', cargo: 'Diretor', status: 'Publicado', date_doe: '2023-10-12', level: 'Especial' },
  { id: '2', name: 'Maria Clara Silveira', registration: '10243-5', organ: 'SEPLAD - Planejamento', area: 'Orçamento', cargo: 'Gerente', status: 'Aguardando DOE', date_doe: null, level: 'I' },
  { id: '3', name: 'Ricardo Souza Lima', registration: '33412-2', organ: 'PGE - Procuradoria', area: 'Jurídico Contencioso', cargo: 'Coordenador', status: 'Publicado', date_doe: '2023-11-05', level: 'II' },
  { id: '4', name: 'Ana Beatriz Souza', registration: '44512-9', organ: 'SES - Saúde', area: 'Saúde Pública', cargo: 'Assessor Técnico', status: 'Em Análise', date_doe: null, level: 'III' },
  { id: '5', name: 'Lucas Ferreira', registration: '11223-4', organ: 'SCC - Casa Civil', area: 'Gabinete', cargo: 'Gerente', status: 'Publicado', date_doe: '2024-01-20', level: 'I' },
];

const FUNCTIONAL_HISTORY = [
  { id: 'h1', servidor_id: '1', name: 'João Alberto Mendes', type: 'NOMINATION', organ: 'SES - Saúde', cargo: 'Assessor', date: '2021-01-15', ato: 'ATO-001/2021' },
  { id: 'h2', servidor_id: '1', name: 'João Alberto Mendes', type: 'EXONERATION', organ: 'SES - Saúde', cargo: 'Assessor', date: '2022-06-30', ato: 'ATO-552/2022' },
  { id: 'h3', servidor_id: '1', name: 'João Alberto Mendes', type: 'NOMINATION', organ: 'SES - Saúde', cargo: 'Diretor', date: '2023-10-10', ato: 'ATO-1024/2023' },
];

// --- Sub-components ---

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Publicado': 'bg-emerald-100 text-emerald-700',
    'Aguardando DOE': 'bg-amber-100 text-amber-700',
    'Em Análise': 'bg-blue-100 text-blue-700',
    'Exonerado': 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status === 'Publicado' && <CheckCircle2 size={12} />}
      {status === 'Aguardando DOE' && <Clock size={12} />}
      {status === 'Em Análise' && <AlertCircle size={12} />}
      {status === 'Exonerado' && <UserMinus size={12} />}
      {status.toUpperCase()}
    </span>
  );
};

const Modal = ({ 
  isOpen, 
  onClose, 
  onSave,
  title, 
  children, 
  errorMessage,
  actionLabel = "Salvar Registro",
  maxWidth
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave?: () => void,
  title: string, 
  children: React.ReactNode, 
  errorMessage?: string | null,
  actionLabel?: string,
  maxWidth?: string
}) => {
  const isDeleteModal = actionLabel?.toLowerCase().includes('excluir') || title.toLowerCase().includes('excluir') || title.toLowerCase().includes('confirmar exclusão');
  const isSmallForm = title.toLowerCase().includes('município') || title.toLowerCase().includes('tipo de órgão');
  const computedMaxWidth = maxWidth || (isDeleteModal ? "max-w-md" : isSmallForm ? "max-w-xl" : "max-w-4xl");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Centered Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full ${computedMaxWidth} max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto border border-slate-100`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {isDeleteModal ? (
                  <Trash2 className="text-rose-600 shrink-0" size={22} />
                ) : title.toLowerCase().includes('editar') ? (
                  <Edit2 className="text-amber-600 shrink-0" size={20} />
                ) : title.toLowerCase().includes('detalhes') ? (
                  <Layers className="text-blue-600 shrink-0" size={22} />
                ) : (
                  <Plus className="text-blue-600 shrink-0" size={22} />
                )}
                {title}
              </h2>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-grow bg-white">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 text-sm"
                >
                  <AlertCircle className="shrink-0" size={20} />
                  <div className="font-medium text-red-800">{errorMessage}</div>
                </motion.div>
              )}
              {children}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
              <button 
                type="button"
                onClick={onClose} 
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-100 transition-colors text-slate-700"
              >
                Cancelar
              </button>
              {actionLabel !== "none" && (
                <button 
                  type="button"
                  onClick={onSave || onClose} 
                  className={`px-8 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg active:scale-95 ${
                    isDeleteModal 
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNewOrganModalOpen, setIsNewOrganModalOpen] = useState(false);
  const [isNewMunicipioModalOpen, setIsNewMunicipioModalOpen] = useState(false);
  const [isNewTipoOrgaoModalOpen, setIsNewTipoOrgaoModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmDeleteMunicipioOpen, setIsConfirmDeleteMunicipioOpen] = useState(false);
  const [isConfirmDeleteTipoOrgaoOpen, setIsConfirmDeleteTipoOrgaoOpen] = useState(false);
  const [isOrganDetailsOpen, setIsOrganDetailsOpen] = useState(false);
  
  // Organ List State
  const [organsList, setOrgansList] = useState<Organ[]>([
    { id: '1', descricao: 'Secretaria de Estado da Saúde', sigla: 'SES', tipo: 'Centrais', sequencia: '10' },
    { id: '2', descricao: 'Secretaria de Estado do Planejamento', sigla: 'SEPLAD', tipo: 'Centrais', sequencia: '20' },
    { id: '3', descricao: 'Procuradoria Geral do Estado', sigla: 'PGE', tipo: 'Centrais', sequencia: '30' },
    { id: '4', descricao: 'Secretaria da Casa Civil', sigla: 'SCC', tipo: 'Gab Gov', sequencia: '05' },
    { id: '5', descricao: 'Secretaria de Desenvolvimento Econômico', sigla: 'SEDEC', tipo: 'Entidades', sequencia: '40' },
    { id: '6', descricao: 'Secretaria da Educação', sigla: 'SED', tipo: 'Centrais', sequencia: '50' },
    { id: '7', descricao: 'Secretaria da Segurança Pública', sigla: 'SSP', tipo: 'Centrais', sequencia: '60' },
    { id: '8', descricao: 'Secretaria de Estado da Fazenda', sigla: 'SEF', tipo: 'Centrais', sequencia: '70' },
    { id: '9', descricao: 'Secretaria de Estado da Administração', sigla: 'SEA', tipo: 'Centrais', sequencia: '80' },
    { id: '10', descricao: 'Secretaria da Agricultura e Pecuária', sigla: 'SAR', tipo: 'Centrais', sequencia: '90' },
    { id: '11', descricao: 'Secretaria de Infraestrutura e Mobilidade', sigla: 'SIE', tipo: 'Centrais', sequencia: '100' },
    { id: '12', descricao: 'Polícia Militar de Santa Catarina', sigla: 'PMSC', tipo: 'Entidades', sequencia: '110' },
    { id: '13', descricao: 'Corpo de Bombeiros Militar de Santa Catarina', sigla: 'CBMSC', tipo: 'Entidades', sequencia: '120' },
    { id: '14', descricao: 'Polícia Civil do Estado de Santa Catarina', sigla: 'PCSC', tipo: 'Entidades', sequencia: '130' },
    { id: '15', descricao: 'Departamento Estadual de Trânsito', sigla: 'DETRAN', tipo: 'Entidades', sequencia: '140' },
    { id: '16', descricao: 'Instituto de Previdência de Santa Catarina', sigla: 'IPREV', tipo: 'Entidades', sequencia: '150' },
    { id: '17', descricao: 'Empresa de Pesquisa Agropecuária de SC', sigla: 'EPAGRI', tipo: 'Entidades', sequencia: '160' },
    { id: '18', descricao: 'Companhia Integrada de Desenv. Agrícola', sigla: 'CIDASC', tipo: 'Entidades', sequencia: '170' },
    { id: '19', descricao: 'Companhia Catarinense de Águas e Saneamento', sigla: 'CASAN', tipo: 'Entidades', sequencia: '180' },
    { id: '20', descricao: 'Centrais Elétricas de Santa Catarina', sigla: 'CELESC', tipo: 'Entidades', sequencia: '190' },
  ]);

  // Global Entities State
  const [municipiosList, setMunicipiosList] = useState<Municipio[]>([
    { id: '1', descricao: 'Florianópolis' },
    { id: '2', descricao: 'Joinville' },
    { id: '3', descricao: 'Blumenau' },
    { id: '4', descricao: 'São José' },
    { id: '5', descricao: 'Chapecó' },
  ]);

  const [tiposOrgaoList, setTiposOrgaoList] = useState<TipoOrgao[]>([
    { id: '1', descricao: 'Centrais' },
    { id: '2', descricao: 'Entidades' },
    { id: '3', descricao: 'Gab Gov' },
  ]);

  const [areasList, setAreasList] = useState<Area[]>([
    { id: 'a1', descricao: 'Gestão Hospitalar', sigla: 'GH', idOrgao: '1' },
    { id: 'a2', descricao: 'Vigilância Sanitária', sigla: 'VS', idOrgao: '1' },
    { id: 'a3', descricao: 'Saúde Pública', sigla: 'SP', idOrgao: '1' },
    { id: 'a4', descricao: 'Orçamento', sigla: 'ORC', idOrgao: '2' },
    { id: 'a5', descricao: 'Projetos Estratégicos', sigla: 'PE', idOrgao: '2' },
    { id: 'a6', descricao: 'Jurídico Contencioso', sigla: 'JC', idOrgao: '3' },
    { id: 'a7', descricao: 'Gabinete', sigla: 'GAB', idOrgao: '4' },
    { id: 'a8', descricao: 'Inovação', sigla: 'INOV', idOrgao: '5' },
    { id: 'a9', descricao: 'Educação Básica', sigla: 'EB', idOrgao: '6' },
    { id: 'a10', descricao: 'Operações Integradas', sigla: 'OI', idOrgao: '7' },
    { id: 'a11', descricao: 'Arrecadação e Tributação', sigla: 'ATRIB', idOrgao: '8' },
    { id: 'a12', descricao: 'Recursos Humanos do Estado', sigla: 'DGRH', idOrgao: '9' },
    { id: 'a13', descricao: 'Defesa Agropecuária', sigla: 'DEFAGRO', idOrgao: '10' },
    { id: 'a14', descricao: 'Obras Viárias', sigla: 'OV', idOrgao: '11' },
    { id: 'a15', descricao: 'Comando Geral', sigla: 'CMDO', idOrgao: '12' },
    { id: 'a16', descricao: 'Operações de Resgate', sigla: 'RESG', idOrgao: '13' },
    { id: 'a17', descricao: 'Investigações Criminais', sigla: 'DIC', idOrgao: '14' },
    { id: 'a18', descricao: 'Habilitação e Veículos', sigla: 'HAB', idOrgao: '15' },
    { id: 'a19', descricao: 'Concessão de Benefícios', sigla: 'BENEF', idOrgao: '16' },
    { id: 'a20', descricao: 'Pesquisa Aplicada', sigla: 'PESQ', idOrgao: '17' },
    { id: 'a21', descricao: 'Inspeção Animal', sigla: 'INSP', idOrgao: '18' },
    { id: 'a22', descricao: 'Tratamento de Água', sigla: 'ETA', idOrgao: '19' },
    { id: 'a23', descricao: 'Distribuição Elétrica', sigla: 'DIST', idOrgao: '20' },
  ]);

  const [cargosList, setCargosList] = useState<Cargo[]>([
    { id: 'c1', descricao: 'Diretor', sigla: 'DIR', idArea: 'a1', gestor: true },
    { id: 'c2', descricao: 'Gerente', sigla: 'GER', idArea: 'a1', gestor: true },
    { id: 'c3', descricao: 'Assessor Técnico', sigla: 'AT', idArea: 'a2', gestor: false },
    { id: 'c4', descricao: 'Assessor Técnico', sigla: 'AT', idArea: 'a3', gestor: false },
    { id: 'c5', descricao: 'Gerente', sigla: 'GER', idArea: 'a4', gestor: true },
    { id: 'c6', descricao: 'Coordenador', sigla: 'COORD', idArea: 'a4', gestor: true },
    { id: 'c7', descricao: 'Analista de Planejamento', sigla: 'AP', idArea: 'a5', gestor: false },
    { id: 'c8', descricao: 'Coordenador', sigla: 'COORD', idArea: 'a6', gestor: true },
    { id: 'c9', descricao: 'Assessor Jurídico', sigla: 'AJ', idArea: 'a6', gestor: false },
    { id: 'c10', descricao: 'Gerente', sigla: 'GER', idArea: 'a7', gestor: true },
    { id: 'c11', descricao: 'Chefe de Gabinete', sigla: 'CG', idArea: 'a7', gestor: true },
    { id: 'c12', descricao: 'Diretor de Inovação', sigla: 'DI', idArea: 'a8', gestor: true },
    { id: 'c13', descricao: 'Assessor de Projetos', sigla: 'AP', idArea: 'a8', gestor: false },
    { id: 'c14', descricao: 'Coordenador Pedagógico', sigla: 'CPED', idArea: 'a9', gestor: true },
    { id: 'c15', descricao: 'Comandante de Operações', sigla: 'COPER', idArea: 'a10', gestor: true },
    { id: 'c16', descricao: 'Auditor Fiscal', sigla: 'AFISC', idArea: 'a11', gestor: true },
    { id: 'c17', descricao: 'Diretor de Gestão de Pessoas', sigla: 'DGP', idArea: 'a12', gestor: true },
    { id: 'c18', descricao: 'Fiscal Agropecuário', sigla: 'FISC', idArea: 'a13', gestor: true },
    { id: 'c19', descricao: 'Engenheiro Fiscal', sigla: 'EFISC', idArea: 'a14', gestor: true },
    { id: 'c20', descricao: 'Oficial de Ligação', sigla: 'OLIG', idArea: 'a15', gestor: false },
    { id: 'c21', descricao: 'Comandante de Batalhão', sigla: 'CBAT', idArea: 'a16', gestor: true },
    { id: 'c22', descricao: 'Delegado Coordenador', sigla: 'DEL', idArea: 'a17', gestor: true },
    { id: 'c23', descricao: 'Gerente de Renavam', sigla: 'GREN', idArea: 'a18', gestor: true },
    { id: 'c24', descricao: 'Analista Previdenciário', sigla: 'APREV', idArea: 'a19', gestor: false },
    { id: 'c25', descricao: 'Pesquisador Chefe', sigla: 'PCHEFE', idArea: 'a20', gestor: true },
    { id: 'c26', descricao: 'Veterinário Fiscal', sigla: 'VFISC', idArea: 'a21', gestor: true },
    { id: 'c27', descricao: 'Químico de Saneamento', sigla: 'QSAN', idArea: 'a22', gestor: false },
    { id: 'c28', descricao: 'Engenheiro de Redes', sigla: 'ERED', idArea: 'a23', gestor: true },
  ]);

  const [nominationsList, setNominationsList] = useState(NOMINATIONS);

  // Modal and Logic States for Structure Management
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isNewAreaModalOpen, setIsNewAreaModalOpen] = useState(false);
  const [isNewCargoModalOpen, setIsNewCargoModalOpen] = useState(false);
  const [selectedStructureOrgan, setSelectedStructureOrgan] = useState<Organ | null>(null);
  const [isConfirmDeleteAreaOpen, setIsConfirmDeleteAreaOpen] = useState(false);
  const [isConfirmDeleteCargoOpen, setIsConfirmDeleteCargoOpen] = useState(false);

  // Form States for Area/Cargo
  const [areaFormData, setAreaFormData] = useState<Area>({ id: '', descricao: '', sigla: '', idOrgao: '' });
  const [cargoFormData, setCargoFormData] = useState<Cargo>({ id: '', descricao: '', sigla: '', idArea: '', gestor: false });
  const [cargoSelectedOrganId, setCargoSelectedOrganId] = useState<string>('');
  const [selectedOrganFilterArea, setSelectedOrganFilterArea] = useState<string>('');
  const [selectedOrganFilterCargo, setSelectedOrganFilterCargo] = useState<string>('');
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);
  const [areaFormError, setAreaFormError] = useState<string | null>(null);
  const [cargoFormError, setCargoFormError] = useState<string | null>(null);

  // Structure Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<
    | { type: 'area'; areaId: string }
    | { type: 'cargo'; cargoId: string; sourceAreaId: string }
    | null
  >(null);
  const [dragOverArea, setDragOverArea] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [dragOverCargo, setDragOverCargo] = useState<{ cargoId: string; areaId: string; position: 'before' | 'after' } | null>(null);
  const [dragOverAreaContainerId, setDragOverAreaContainerId] = useState<string | null>(null);
  const [structureToast, setStructureToast] = useState<{ message: string; timestamp: number } | null>(null);
  const [structureSearchTerm, setStructureSearchTerm] = useState('');
  const [collapsedAreaIds, setCollapsedAreaIds] = useState<Set<string>>(new Set());

  // Organ Management State
  const [organSearchTerm, setOrganSearchTerm] = useState('');
  const [selectedOrganIds, setSelectedOrganIds] = useState<Set<string>>(new Set());
  const [organPage, setOrganPage] = useState(1);
  const [organItemsPerPage] = useState(15);
  type OrganSortField = 'descricao' | 'sigla' | 'tipo' | 'areas' | 'cargos' | 'ocupados' | 'livres';
  const [organSortField, setOrganSortField] = useState<OrganSortField>('descricao');
  const [organSortDir, setOrganSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Tab Management
  const [activeCadastrosTab, setActiveCadastrosTab] = useState<'municipios' | 'tipos'>('municipios');
  
  // Advanced Filters State
  const [filterOrgan, setFilterOrgan] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // History State
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedServidorHistory, setSelectedServidorHistory] = useState<any[] | null>(null);

  // New Nomination Form State
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    organ: '',
    area: '',
    cargo: '',
    level: 'I',
    typeServidor: 'Efetivo',
    lotacao: '',
    dataSea: '',
    dataDoe: '',
    numeroAto: '',
    status: 'Aguardando DOE',
    municipio: 'Florianópolis',
    associacao: 'GRANFPOLIS'
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Entity Form States
  const [organFormData, setOrganFormData] = useState({ id: '', descricao: '', sigla: '', tipo: 'Centrais', sequencia: '' });
  const [organFormError, setOrganFormError] = useState<string | null>(null);
  const [organToDelete, setOrganToDelete] = useState<Organ | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);

  const [municipioFormData, setMunicipioFormData] = useState({ id: '', descricao: '' });
  const [municipioFormError, setMunicipioFormError] = useState<string | null>(null);
  const [municipioToDelete, setMunicipioToDelete] = useState<Municipio | null>(null);

  const [tipoOrgaoFormData, setTipoOrgaoFormData] = useState({ id: '', descricao: '' });
  const [tipoOrgaoFormError, setTipoOrgaoFormError] = useState<string | null>(null);
  const [tipoOrgaoToDelete, setTipoOrgaoToDelete] = useState<TipoOrgao | null>(null);

  // Management State
  const [activeAdminTab, setActiveAdminTab] = useState<'areas' | 'cargos'>('areas');

  const checkActiveNomination = (reg: string, organ: string) => {
    return nominationsList.find(n => n.registration === reg && n.organ === organ && n.status !== 'Exonerado');
  };

  const handleSaveNomination = () => {
    if (!formData.name || !formData.registration || !formData.organ || !formData.area || !formData.cargo) {
      setFormError('Por favor, preencha todos os campos obrigatórios (Nome, Matrícula, Órgão, Área e Cargo).');
      return;
    }

    const existing = checkActiveNomination(formData.registration, formData.organ);
    if (existing) {
      setFormError(`O servidor ${formData.registration} já possui uma nomeação ATIVA no órgão ${formData.organ}. Não é permitido duplicar nomeações ativas no mesmo órgão.`);
      return;
    }

    const newNomination = {
      id: String(Date.now()),
      name: formData.name,
      registration: formData.registration,
      organ: formData.organ,
      area: formData.area,
      cargo: formData.cargo,
      status: formData.status || 'Publicado',
      date_doe: formData.dataDoe || new Date().toISOString().split('T')[0],
      level: formData.level || 'I',
    };

    setNominationsList(prev => [newNomination, ...prev]);
    setIsNewModalOpen(false);
    setFormError(null);
  };

  const handleSaveOrgan = () => {
    if (!organFormData.descricao || !organFormData.sigla || !organFormData.sequencia) {
      setOrganFormError('Todos os campos do Órgão são obrigatórios.');
      return;
    }
    
    if (organFormData.id) {
      // Update
      setOrgansList(prev => prev.map(o => o.id === organFormData.id ? { ...organFormData } : o));
      console.log('Órgão atualizado:', organFormData);
    } else {
      // Create
      const newOrgan = { ...organFormData, id: Math.random().toString(36).substr(2, 9) };
      setOrgansList(prev => [...prev, newOrgan]);
      console.log('Novo órgão salvo:', newOrgan);
    }
    
    setIsNewOrganModalOpen(false);
    setOrganFormError(null);
    setOrganFormData({ id: '', descricao: '', sigla: '', tipo: 'Centrais', sequencia: '' });
  };

  const handleEditOrgan = (organ: Organ) => {
    setOrganFormData(organ);
    setOrganFormError(null);
    setIsNewOrganModalOpen(true);
  };

  const handleOpenDeleteConfirm = (organ: Organ) => {
    setOrganToDelete(organ);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (organToDelete) {
      setOrgansList(prev => prev.filter(o => o.id !== organToDelete.id));
      console.log('Órgão excluído (soft delete simulação):', organToDelete);
      setIsConfirmDeleteOpen(false);
      setOrganToDelete(null);
    }
  };

  const handleOpenDetails = (organ: Organ) => {
    setSelectedOrgan(organ);
    setIsOrganDetailsOpen(true);
  };

  const toggleSort = (field: OrganSortField) => {
    if (organSortField === field) {
      setOrganSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrganSortField(field);
      setOrganSortDir('asc');
    }
    setOrganPage(1);
  };

  const handleBulkDelete = () => {
    if (selectedOrganIds.size === 0) return;
    setOrgansList(prev => prev.filter(o => !selectedOrganIds.has(o.id)));
    setSelectedOrganIds(new Set());
    console.log('Exclusão em massa realizada:', Array.from(selectedOrganIds));
  };

  const toggleSelectAll = () => {
    if (selectedOrganIds.size === sortedAndPaginatedOrgans.length) {
      setSelectedOrganIds(new Set());
    } else {
      setSelectedOrganIds(new Set(sortedAndPaginatedOrgans.map(o => o.id)));
    }
  };

  const toggleSelectOrgan = (id: string) => {
    const next = new Set(selectedOrganIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrganIds(next);
  };

  const handleSaveMunicipio = () => {
    if (!municipioFormData.descricao) {
      setMunicipioFormError('A descrição é obrigatória.');
      return;
    }
    if (municipioFormData.id) {
      setMunicipiosList(prev => prev.map(m => m.id === municipioFormData.id ? municipioFormData : m));
    } else {
      setMunicipiosList(prev => [...prev, { ...municipioFormData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsNewMunicipioModalOpen(false);
    setMunicipioFormData({ id: '', descricao: '' });
  };

  const handleSaveTipoOrgao = () => {
    if (!tipoOrgaoFormData.descricao) {
      setTipoOrgaoFormError('A descrição é obrigatória.');
      return;
    }
    const exists = tiposOrgaoList.find(t => t.descricao.toLowerCase() === tipoOrgaoFormData.descricao.toLowerCase() && t.id !== tipoOrgaoFormData.id);
    if (exists) {
      setTipoOrgaoFormError('Já existe um tipo de órgão com esta descrição.');
      return;
    }
    if (tipoOrgaoFormData.id) {
      setTiposOrgaoList(prev => prev.map(t => t.id === tipoOrgaoFormData.id ? tipoOrgaoFormData : t));
    } else {
      setTiposOrgaoList(prev => [...prev, { ...tipoOrgaoFormData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsNewTipoOrgaoModalOpen(false);
    setTipoOrgaoFormData({ id: '', descricao: '' });
  };

  const handleOpenStructure = (organ: Organ) => {
    setSelectedStructureOrgan(organ);
    setIsStructureModalOpen(true);
  };

  const handleSaveArea = () => {
    if (!areaFormData.descricao || !areaFormData.sigla || !areaFormData.idOrgao) {
      setAreaFormError('Todos os campos da Área são obrigatórios, incluindo o Órgão Vinculado.');
      return;
    }
    
    if (areaFormData.id) {
      setAreasList(prev => prev.map(a => a.id === areaFormData.id ? { ...areaFormData } : a));
    } else {
      const newArea = { 
        ...areaFormData, 
        id: Math.random().toString(36).substr(2, 9),
        idOrgao: areaFormData.idOrgao || selectedStructureOrgan?.id || '' 
      };
      setAreasList(prev => [...prev, newArea]);
    }
    setIsNewAreaModalOpen(false);
    setAreaFormError(null);
  };

  const handleSaveCargo = () => {
    if (!cargoSelectedOrganId) {
      setCargoFormError('É necessário selecionar o Órgão vinculado.');
      return;
    }
    if (!cargoFormData.idArea) {
      setCargoFormError('É necessário selecionar a Área Relacionada vinculada ao órgão selecionado.');
      return;
    }
    if (!cargoFormData.descricao || !cargoFormData.sigla) {
      setCargoFormError('Todos os campos do Cargo são obrigatórios (Órgão, Área, Descrição e Sigla).');
      return;
    }
    
    if (cargoFormData.id) {
      setCargosList(prev => prev.map(c => c.id === cargoFormData.id ? { ...cargoFormData, idOrgao: cargoSelectedOrganId } : c));
    } else {
      const newCargo = { 
        ...cargoFormData, 
        id: Math.random().toString(36).substr(2, 9),
        idOrgao: cargoSelectedOrganId
      };
      setCargosList(prev => [...prev, newCargo]);
    }
    setIsNewCargoModalOpen(false);
    setCargoFormError(null);
  };

  const showStructureNotice = (message: string) => {
    setStructureToast({ message, timestamp: Date.now() });
  };

  React.useEffect(() => {
    if (structureToast) {
      const timer = setTimeout(() => {
        setStructureToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [structureToast]);

  const toggleAreaCollapse = (areaId: string) => {
    setCollapsedAreaIds(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  // Drag and drop handlers for Areas
  const handleAreaDragStart = (e: React.DragEvent, areaId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'area', areaId }));
    setDraggedItem({ type: 'area', areaId });
  };

  const handleAreaDragOver = (e: React.DragEvent, areaId: string) => {
    if (!draggedItem || draggedItem.type !== 'area' || draggedItem.areaId === areaId) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const position = relY < rect.height / 2 ? 'before' : 'after';
    
    if (!dragOverArea || dragOverArea.id !== areaId || dragOverArea.position !== position) {
      setDragOverArea({ id: areaId, position });
    }
  };

  const handleAreaDragLeave = (e: React.DragEvent, areaId: string) => {
    if (dragOverArea?.id === areaId) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom
      ) {
        setDragOverArea(null);
      }
    }
  };

  const handleAreaDrop = (e: React.DragEvent, targetAreaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.type !== 'area') return;
    const sourceAreaId = draggedItem.areaId;
    if (sourceAreaId === targetAreaId) {
      setDraggedItem(null);
      setDragOverArea(null);
      return;
    }
    
    const currentOrganId = selectedStructureOrgan?.id;
    if (!currentOrganId) return;

    const organAreas = areasList.filter(a => a.idOrgao === currentOrganId);
    const sourceIdx = organAreas.findIndex(a => a.id === sourceAreaId);
    const targetIdx = organAreas.findIndex(a => a.id === targetAreaId);
    
    if (sourceIdx === -1 || targetIdx === -1) {
      setDraggedItem(null);
      setDragOverArea(null);
      return;
    }
    
    const pos = dragOverArea?.position || 'after';
    const reordered = [...organAreas];
    const [movedArea] = reordered.splice(sourceIdx, 1);
    let newTargetIdx = reordered.findIndex(a => a.id === targetAreaId);
    if (pos === 'after') {
      newTargetIdx += 1;
    }
    reordered.splice(newTargetIdx, 0, movedArea);

    let organIndex = 0;
    const updatedAreasList = areasList.map(a => {
      if (a.idOrgao === currentOrganId) {
        const item = reordered[organIndex];
        organIndex++;
        return item;
      }
      return a;
    });
    
    setAreasList(updatedAreasList);
    
    const linkedCargosCount = cargosList.filter(c => c.idArea === movedArea.id).length;
    showStructureNotice(
      `Área "${movedArea.descricao}" movida com sucesso! (${linkedCargosCount} ${linkedCargosCount === 1 ? 'cargo vinculado acompanhou' : 'cargos vinculados acompanharam'})`
    );
    
    setDraggedItem(null);
    setDragOverArea(null);
  };

  // Drag and drop handlers for Cargos
  const handleCargoDragStart = (e: React.DragEvent, cargoId: string, areaId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'cargo', cargoId, sourceAreaId: areaId }));
    setDraggedItem({ type: 'cargo', cargoId, sourceAreaId: areaId });
  };

  const handleCargoDragOver = (e: React.DragEvent, cargoId: string, areaId: string) => {
    if (!draggedItem || draggedItem.type !== 'cargo' || draggedItem.cargoId === cargoId) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const position = relY < rect.height / 2 ? 'before' : 'after';
    
    if (!dragOverCargo || dragOverCargo.cargoId !== cargoId || dragOverCargo.position !== position) {
      setDragOverCargo({ cargoId, areaId, position });
    }
  };

  const handleCargoDragLeave = (e: React.DragEvent, cargoId: string) => {
    if (dragOverCargo?.cargoId === cargoId) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom
      ) {
        setDragOverCargo(null);
      }
    }
  };

  const handleCargoDropOnCargo = (e: React.DragEvent, targetCargoId: string, targetAreaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.type !== 'cargo') return;
    const { cargoId: sourceCargoId, sourceAreaId } = draggedItem;
    if (sourceCargoId === targetCargoId) {
      setDraggedItem(null);
      setDragOverCargo(null);
      return;
    }
    
    const sourceCargo = cargosList.find(c => c.id === sourceCargoId);
    const targetCargo = cargosList.find(c => c.id === targetCargoId);
    if (!sourceCargo || !targetCargo) {
      setDraggedItem(null);
      setDragOverCargo(null);
      return;
    }
    
    const pos = dragOverCargo?.position || 'after';
    const updatedCargo: Cargo = {
      ...sourceCargo,
      idArea: targetAreaId,
      idOrgao: selectedStructureOrgan?.id || sourceCargo.idOrgao
    };

    const remaining = cargosList.filter(c => c.id !== sourceCargoId);
    const targetIdx = remaining.findIndex(c => c.id === targetCargoId);
    const insertIdx = pos === 'after' ? targetIdx + 1 : targetIdx;
    
    remaining.splice(insertIdx, 0, updatedCargo);
    setCargosList(remaining);
    
    const targetArea = areasList.find(a => a.id === targetAreaId);
    const sourceArea = areasList.find(a => a.id === sourceAreaId);
    
    if (sourceAreaId === targetAreaId) {
      showStructureNotice(`Ordem do cargo "${sourceCargo.descricao}" atualizada em "${targetArea?.descricao || ''}"!`);
    } else {
      showStructureNotice(`Cargo "${sourceCargo.descricao}" transferido de "${sourceArea?.descricao || 'Área anterior'}" para "${targetArea?.descricao || 'Nova Área'}"!`);
    }
    
    setDraggedItem(null);
    setDragOverCargo(null);
    setDragOverAreaContainerId(null);
  };

  const handleCargoDropOnArea = (e: React.DragEvent, targetAreaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.type !== 'cargo') return;
    const { cargoId: sourceCargoId, sourceAreaId } = draggedItem;
    
    const sourceCargo = cargosList.find(c => c.id === sourceCargoId);
    if (!sourceCargo) {
      setDraggedItem(null);
      setDragOverAreaContainerId(null);
      return;
    }

    if (sourceAreaId === targetAreaId) {
      setDraggedItem(null);
      setDragOverAreaContainerId(null);
      return;
    }

    const updatedCargo: Cargo = {
      ...sourceCargo,
      idArea: targetAreaId,
      idOrgao: selectedStructureOrgan?.id || sourceCargo.idOrgao
    };

    const remaining = cargosList.filter(c => c.id !== sourceCargoId);
    let lastTargetCargoIdx = -1;
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (remaining[i].idArea === targetAreaId) {
        lastTargetCargoIdx = i;
        break;
      }
    }
    
    if (lastTargetCargoIdx !== -1) {
      remaining.splice(lastTargetCargoIdx + 1, 0, updatedCargo);
    } else {
      remaining.push(updatedCargo);
    }

    setCargosList(remaining);
    const targetArea = areasList.find(a => a.id === targetAreaId);
    const sourceArea = areasList.find(a => a.id === sourceAreaId);
    showStructureNotice(`Cargo "${sourceCargo.descricao}" transferido de "${sourceArea?.descricao || 'Área anterior'}" para "${targetArea?.descricao || 'Nova Área'}"!`);

    setDraggedItem(null);
    setDragOverAreaContainerId(null);
    setDragOverCargo(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverArea(null);
    setDragOverCargo(null);
    setDragOverAreaContainerId(null);
  };

  const getOrganStats = useCallback((organ: Organ) => {
    const organAreas = areasList.filter(a => a.idOrgao === organ.id);
    const organAreaIds = new Set(organAreas.map(a => a.id));
    const organCargos = cargosList.filter(c => organAreaIds.has(c.idArea) || c.idOrgao === organ.id);

    // Active nominations for this organ
    const organNominations = nominationsList.filter(n => {
      if (n.status === 'Exonerado') return false;
      const matchSigla = n.organ === organ.sigla || 
                         n.organ.startsWith(organ.sigla + ' ') || 
                         n.organ.startsWith(organ.sigla + ' -');
      const matchDesc = n.organ === organ.descricao || 
                        organ.descricao.toLowerCase().includes(n.organ.toLowerCase()) ||
                        n.organ.toLowerCase().includes(organ.descricao.toLowerCase());
      const matchId = (n as any).organId === organ.id;
      return matchSigla || matchDesc || matchId;
    });

    const remainingNominations = [...organNominations];
    let occupiedCount = 0;

    for (const cargo of organCargos) {
      const cargoArea = organAreas.find(a => a.id === cargo.idArea);
      
      let matchIdx = remainingNominations.findIndex(n => {
        const matchCargo = n.cargo.trim().toLowerCase() === cargo.descricao.trim().toLowerCase();
        const matchArea = cargoArea && n.area && n.area.trim().toLowerCase() === cargoArea.descricao.trim().toLowerCase();
        return matchCargo && matchArea;
      });

      if (matchIdx === -1) {
        matchIdx = remainingNominations.findIndex(n => {
          return n.cargo.trim().toLowerCase() === cargo.descricao.trim().toLowerCase();
        });
      }

      if (matchIdx !== -1) {
        occupiedCount++;
        remainingNominations.splice(matchIdx, 1);
      }
    }

    if (remainingNominations.length > 0 && occupiedCount < organCargos.length) {
      const extra = Math.min(remainingNominations.length, organCargos.length - occupiedCount);
      occupiedCount += extra;
    }

    const freeCount = Math.max(0, organCargos.length - occupiedCount);

    return {
      areas: organAreas.length,
      cargos: organCargos.length,
      ocupados: occupiedCount,
      livres: freeCount
    };
  }, [areasList, cargosList, nominationsList]);

  const sortedAndPaginatedOrgans = useMemo(() => {
    const filtered = organsList.filter(o => 
      o.descricao.toLowerCase().includes(organSearchTerm.toLowerCase()) || 
      o.sigla.toLowerCase().includes(organSearchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      if (organSortField === 'descricao' || organSortField === 'sigla') {
        const valA = (a[organSortField] || '').toLowerCase();
        const valB = (b[organSortField] || '').toLowerCase();
        if (valA < valB) return organSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return organSortDir === 'asc' ? 1 : -1;
        return 0;
      } else if (organSortField === 'tipo') {
        const valA = (a.tipo || '').toLowerCase();
        const valB = (b.tipo || '').toLowerCase();
        if (valA < valB) return organSortDir === 'asc' ? -1 : 1;
        if (valA > valB) return organSortDir === 'asc' ? 1 : -1;
        return 0;
      } else {
        const statsA = getOrganStats(a);
        const statsB = getOrganStats(b);
        const valA = statsA[organSortField];
        const valB = statsB[organSortField];
        return organSortDir === 'asc' ? valA - valB : valB - valA;
      }
    });

    const start = (organPage - 1) * organItemsPerPage;
    return sorted.slice(start, start + organItemsPerPage);
  }, [organsList, organSortField, organSortDir, organPage, organItemsPerPage, organSearchTerm, getOrganStats]);

  const totalFilteredOrgans = useMemo(() => {
    return organsList.filter(o => 
      o.descricao.toLowerCase().includes(organSearchTerm.toLowerCase()) || 
      o.sigla.toLowerCase().includes(organSearchTerm.toLowerCase())
    ).length;
  }, [organsList, organSearchTerm]);

  const totalOrganPages = Math.ceil(totalFilteredOrgans / organItemsPerPage);

  const filteredNominations = useMemo(() => {
    return nominationsList.filter(item => {
      const matchOrgan = !filterOrgan || 
        item.organ === filterOrgan || 
        item.organ.startsWith(filterOrgan + ' ') || 
        item.organ.startsWith(filterOrgan + ' -');
      const matchArea = !filterArea || item.area === filterArea;
      const matchCargo = !filterCargo || item.cargo === filterCargo;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchSearch = !filterSearch || 
        item.name.toLowerCase().includes(filterSearch.toLowerCase()) || 
        item.registration.includes(filterSearch);
      return matchOrgan && matchArea && matchCargo && matchStatus && matchSearch;
    });
  }, [nominationsList, filterOrgan, filterArea, filterCargo, filterStatus, filterSearch]);

  const handleSearchHistory = () => {
    if (!historySearchTerm) return;
    const results = FUNCTIONAL_HISTORY.filter(h => 
      h.name.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
      h.servidor_id === historySearchTerm
    );
    setSelectedServidorHistory(results.length > 0 ? results : []);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - fixed and pinned, never scrolls with screen content */}
      <aside className="w-64 bg-[#0F172A] text-[#94A3B8] flex flex-col shrink-0 h-full border-r border-[#1E293B] select-none z-20">
        <div className="p-6 flex items-center gap-3 text-[#F8FAFC] font-bold text-xl tracking-tight shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-black">S</div>
          <span>SGN Admin</span>
          <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded ml-auto">v1.0</span>
        </div>

        <nav className="flex-grow mt-2 overflow-y-auto px-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-[calc(100%-24px)] flex items-center gap-3 px-4 py-2.5 mx-3 my-1 rounded-lg transition-all cursor-pointer text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-white/5 hover:text-[#F8FAFC]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 text-xs opacity-50 border-t border-[#1E293B] shrink-0">
          Tenant: Administração Central
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] text-sm flex items-center gap-1">
              SGN <ChevronRight size={14} />
            </span>
            <span className="font-semibold text-slate-900">{NAV_ITEMS.find(i => i.id === activeTab)?.label}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-[#F1F5F9] rounded-lg px-3 py-1.5 gap-2 border border-[#E2E8F0] focus-within:border-blue-400 transition-colors">
              <Search size={16} className="text-[#64748B]" />
              <input 
                type="text" 
                placeholder="Buscar em todo o sistema..." 
                className="bg-transparent border-none outline-none text-sm w-48 text-slate-900 placeholder:text-[#94A3B8]"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-[#F1F5F9] rounded-full text-[#64748B] relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 h-10 pl-4 border-l border-[#E2E8F0]">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">Arquiteto Sênior</div>
                  <div className="text-[11px] text-[#64748B]">root@gov.br</div>
                </div>
                <div className="w-9 h-9 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100 hover:ring-blue-400 transition-all cursor-pointer">
                  AS
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content container for all screens */}
        <div className="p-6 overflow-y-auto flex-grow min-h-0 bg-slate-50/30">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {[
                  { label: 'TOTAL NOMEAÇÕES', value: '1,428', color: 'text-slate-900' },
                  { label: 'ÓRGÃOS ATIVOS', value: '54', color: 'text-slate-900' },
                  { label: 'PENDENTES DOE', value: '12', color: 'text-amber-600' },
                  { label: 'API UPTIME', value: '99.9%', color: 'text-emerald-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                    <div className="text-xs text-[#64748B] font-semibold tracking-wider uppercase">{stat.label}</div>
                    <div className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <Activity size={12} className="text-blue-500" />
                      Sincronizado agora
                    </div>
                  </div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      Nomeações Recentes
                    </h3>
                    <button onClick={() => setIsNewModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white border-none py-2 px-4 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
                      <Plus size={16} />
                      Nova Nomeação
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                        <tr>
                          <th className="px-5 py-3.5">Servidor</th>
                          <th className="px-5 py-3.5">Órgão</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {filteredNominations.slice(0, 3).map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-900">{row.name}</div>
                              <div className="text-[11px] text-[#94A3B8]">Matrícula: {row.registration}</div>
                            </td>
                            <td className="px-5 py-4 text-slate-600 font-medium">{row.organ}</td>
                            <td className="px-5 py-4">
                              <Badge status={row.status} />
                            </td>
                            <td className="px-5 py-4">
                              <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline cursor-pointer">
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] text-center">
                    <button onClick={() => setActiveTab('nomeacoes')} className="text-slate-500 hover:text-slate-900 text-xs font-semibold px-4 py-1 rounded transition-colors">
                      Ver todas as nomeações
                    </button>
                  </div>
                </section>

                <div className="flex flex-col gap-6">
                  <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-l-4 border-l-blue-600">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <History size={18} className="text-blue-600" />
                      Histórico Funcional
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Busque o histórico completo de nomeações e exonerações de qualquer servidor cadastrado no sistema.
                    </p>
                    <div className="relative mb-3">
                      <input 
                        type="text" 
                        placeholder="Nome ou Matrícula..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                      />
                    </div>
                    <button onClick={() => { setActiveTab('auditoria'); handleSearchHistory(); }} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                      Consultar Histórico
                    </button>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orgaos' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">Gestão de Órgãos</h3>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">{totalFilteredOrgans} Resultados</span>
                  </div>
                  
                  <div className="flex-grow max-w-md w-full relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filtrar por nome ou sigla..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                      value={organSearchTerm}
                      onChange={(e) => setOrganSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrganIds.size > 0 && (
                      <button 
                        onClick={handleBulkDelete}
                        className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-100 flex items-center gap-2 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={16} /> Excluir ({selectedOrganIds.size})
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setOrganFormData({ id: '', descricao: '', sigla: '', tipo: 'Centrais', sequencia: '' });
                        setIsNewOrganModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={16} /> Novo Órgão
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E2E8F0] uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4 w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={sortedAndPaginatedOrgans.length > 0 && selectedOrganIds.size === sortedAndPaginatedOrgans.length}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('descricao')}
                        >
                          <div className="flex items-center gap-2">
                            Descrição
                            <ArrowUpDown size={12} className={organSortField === 'descricao' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('sigla')}
                        >
                          <div className="flex items-center gap-2">
                            Sigla
                            <ArrowUpDown size={12} className={organSortField === 'sigla' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-5 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('tipo')}
                        >
                          <div className="flex items-center gap-2">
                            Tipo
                            <ArrowUpDown size={12} className={organSortField === 'tipo' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('areas')}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            Áreas
                            <ArrowUpDown size={12} className={organSortField === 'areas' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('cargos')}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            Cargos
                            <ArrowUpDown size={12} className={organSortField === 'cargos' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('ocupados')}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            Cargos Ocupados
                            <ArrowUpDown size={12} className={organSortField === 'ocupados' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th 
                          className="px-4 py-4 text-center cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => toggleSort('livres')}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            Cargos Livres
                            <ArrowUpDown size={12} className={organSortField === 'livres' ? 'text-blue-600' : 'text-slate-300'} />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedAndPaginatedOrgans.length > 0 ? sortedAndPaginatedOrgans.map(o => {
                        const stats = getOrganStats(o);
                        return (
                          <tr key={o.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedOrganIds.has(o.id) ? 'bg-blue-50/50' : ''}`}>
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={selectedOrganIds.has(o.id)}
                                onChange={() => toggleSelectOrgan(o.id)}
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{o.descricao}</td>
                            <td className="px-6 py-4 text-slate-600 font-mono font-bold uppercase">{o.sigla}</td>
                            <td className="px-6 py-4">
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-slate-200">
                                {o.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span 
                                title={`${stats.areas} ${stats.areas === 1 ? 'área vinculada' : 'áreas vinculadas'}`}
                                className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {stats.areas}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span 
                                title={`${stats.cargos} ${stats.cargos === 1 ? 'cargo vinculado' : 'cargos vinculados'}`}
                                className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {stats.cargos}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span 
                                title={`${stats.ocupados} ${stats.ocupados === 1 ? 'cargo ocupado (com nomeação)' : 'cargos ocupados (com nomeação)'}`}
                                className={`inline-flex items-center justify-center gap-1.5 min-w-[28px] px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  stats.ocupados > 0 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${stats.ocupados > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                {stats.ocupados}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span 
                                title={`${stats.livres} ${stats.livres === 1 ? 'cargo livre (sem nomeação)' : 'cargos livres (sem nomeação)'}`}
                                className={`inline-flex items-center justify-center gap-1.5 min-w-[28px] px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  stats.livres > 0 
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${stats.livres > 0 ? 'bg-sky-500' : 'bg-slate-300'}`}></span>
                                {stats.livres}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleOpenStructure(o)}
                                  title="Gestão de Estrutura"
                                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all shadow-sm"
                                >
                                  <Layers size={16} />
                                </button>
                                <button 
                                  onClick={() => handleOpenDetails(o)}
                                  title="Detalhes"
                                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all shadow-sm group/btn"
                                >
                                  <Info size={16} />
                                </button>
                                <button 
                                  onClick={() => handleEditOrgan(o)}
                                  title="Editar"
                                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 border border-transparent hover:border-amber-100 transition-all shadow-sm"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleOpenDeleteConfirm(o)}
                                  title="Excluir"
                                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all shadow-sm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                            Nenhum órgão encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex justify-between items-center shrink-0">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Mostrando <span className="font-bold text-slate-900">{sortedAndPaginatedOrgans.length}</span> de <span className="font-bold text-slate-900">{totalFilteredOrgans}</span> órgãos <span className="text-slate-400 font-normal">(15 órgãos por página)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setOrganPage(prev => Math.max(1, prev - 1))}
                      disabled={organPage === 1}
                      title="Página anterior"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalOrganPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setOrganPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                            organPage === i + 1 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setOrganPage(prev => Math.min(totalOrganPages, prev + 1))}
                      disabled={organPage === totalOrganPages || totalOrganPages === 0}
                      title="Próxima página"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'cadastros' && (
            <div className="space-y-6">
              <div className="flex gap-4 border-b border-slate-200 mb-2">
                <button 
                  onClick={() => setActiveCadastrosTab('municipios')}
                  className={`pb-3 px-2 text-sm font-bold transition-all ${activeCadastrosTab === 'municipios' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    Municípios
                  </div>
                </button>
                <button 
                  onClick={() => setActiveCadastrosTab('tipos')}
                  className={`pb-3 px-2 text-sm font-bold transition-all ${activeCadastrosTab === 'tipos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    Tipos de Órgão
                  </div>
                </button>
              </div>

              {activeCadastrosTab === 'municipios' && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-900">Gestão de Municípios</h3>
                    <button 
                      onClick={() => { setMunicipioFormData({ id: '', descricao: '' }); setIsNewMunicipioModalOpen(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Município
                    </button>
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Descrição</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {municipiosList.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900">{m.descricao}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => { setMunicipioFormData(m); setIsNewMunicipioModalOpen(true); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => { setMunicipioToDelete(m); setIsConfirmDeleteMunicipioOpen(true); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeCadastrosTab === 'tipos' && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-900">Tipos de Órgão</h3>
                    <button 
                      onClick={() => { setTipoOrgaoFormData({ id: '', descricao: '' }); setIsNewTipoOrgaoModalOpen(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Tipo
                    </button>
                  </div>
                  <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Tipo de Órgão</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {tiposOrgaoList.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900 uppercase font-mono">{t.descricao}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => { setTipoOrgaoFormData(t); setIsNewTipoOrgaoModalOpen(true); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => { setTipoOrgaoToDelete(t); setIsConfirmDeleteTipoOrgaoOpen(true); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'areas' && (
            <div className="space-y-6">
              <div className="flex gap-4 border-b border-slate-200 mb-2">
                <button 
                  onClick={() => setActiveAdminTab('areas')}
                  className={`pb-3 px-2 text-sm font-bold transition-all ${activeAdminTab === 'areas' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
                >
                  Áreas
                </button>
                <button 
                  onClick={() => setActiveAdminTab('cargos')}
                  className={`pb-3 px-2 text-sm font-bold transition-all ${activeAdminTab === 'cargos' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
                >
                  Cargos
                </button>
              </div>

              {activeAdminTab === 'areas' && (
                 <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">Gestão de Áreas</h3>
                          <p className="text-xs text-slate-500">
                            {selectedOrganFilterArea ? (
                              <span>
                                Filtrando por <strong>{organsList.find(o => o.id === selectedOrganFilterArea)?.sigla}</strong> ({areasList.filter(a => a.idOrgao === selectedOrganFilterArea).length} {areasList.filter(a => a.idOrgao === selectedOrganFilterArea).length === 1 ? 'área' : 'áreas'})
                              </span>
                            ) : (
                              <span>Total de {areasList.length} áreas cadastradas</span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                          <Building2 size={16} className="text-slate-400 shrink-0" />
                          <label htmlFor="organ-area-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                            Órgão:
                          </label>
                          <select 
                            id="organ-area-filter"
                            value={selectedOrganFilterArea}
                            onChange={(e) => setSelectedOrganFilterArea(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer max-w-[220px] sm:max-w-xs truncate"
                          >
                            <option value="">Todos os Órgãos ({organsList.length})</option>
                            {organsList.map(o => (
                              <option key={o.id} value={o.id}>
                                {o.sigla} - {o.descricao}
                              </option>
                            ))}
                          </select>
                          {selectedOrganFilterArea && (
                            <button 
                              onClick={() => setSelectedOrganFilterArea('')}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold ml-1 hover:underline whitespace-nowrap"
                              title="Limpar filtro de órgão"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedStructureOrgan(null);
                          setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: selectedOrganFilterArea || '' });
                          setAreaFormError(null);
                          setIsNewAreaModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                      >
                        <Plus size={14} /> Nova Área
                      </button>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-6 py-3">Área</th>
                          <th className="px-6 py-3">Órgão Vinculado</th>
                          <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {areasList
                          .filter(area => !selectedOrganFilterArea || area.idOrgao === selectedOrganFilterArea)
                          .map(area => {
                            const organ = organsList.find(o => o.id === area.idOrgao);
                            return (
                              <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-900">{area.descricao}</div>
                                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{area.sigla}</span>
                                </td>
                                <td className="px-6 py-4">
                                  {organ ? (
                                    <div>
                                      <span className="font-bold text-slate-800 text-xs">{organ.sigla}</span>
                                      <span className="text-xs text-slate-500 block truncate max-w-sm">{organ.descricao}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">Não vinculado</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => { 
                                      setSelectedStructureOrgan(null);
                                      setAreaFormData(area); 
                                      setAreaFormError(null); 
                                      setIsNewAreaModalOpen(true); 
                                    }} 
                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                  >
                                    Editar
                                  </button>
                                  <button onClick={() => { setAreaToDelete(area); setIsConfirmDeleteAreaOpen(true); }} className="text-rose-600 hover:text-rose-800 font-bold text-xs ml-3">Excluir</button>
                                </td>
                              </tr>
                            );
                          })}
                        {areasList.filter(area => !selectedOrganFilterArea || area.idOrgao === selectedOrganFilterArea).length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                              <Layers size={36} className="mx-auto mb-2 opacity-30 text-slate-400" />
                              <p className="font-semibold text-slate-700 text-sm">Nenhuma área encontrada para este órgão.</p>
                              <p className="text-xs text-slate-400 mt-1">Cadastre uma nova área vinculada ao órgão selecionado.</p>
                              <button
                                onClick={() => {
                                  setSelectedStructureOrgan(null);
                                  setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: selectedOrganFilterArea || '' });
                                  setAreaFormError(null);
                                  setIsNewAreaModalOpen(true);
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                              >
                                <Plus size={13} /> Cadastrar Nova Área
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              )}

              {activeAdminTab === 'cargos' && (
                 <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">Gestão de Cargos</h3>
                          <p className="text-xs text-slate-500">
                            {selectedOrganFilterCargo ? (
                              <span>
                                Filtrando por <strong>{organsList.find(o => o.id === selectedOrganFilterCargo)?.sigla}</strong>
                              </span>
                            ) : (
                              <span>Total de {cargosList.length} cargos cadastrados</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                          <Building2 size={16} className="text-slate-400 shrink-0" />
                          <label htmlFor="organ-cargo-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                            Órgão:
                          </label>
                          <select 
                            id="organ-cargo-filter"
                            value={selectedOrganFilterCargo}
                            onChange={(e) => setSelectedOrganFilterCargo(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer max-w-[220px] sm:max-w-xs truncate"
                          >
                            <option value="">Todos os Órgãos ({organsList.length})</option>
                            {organsList.map(o => (
                              <option key={o.id} value={o.id}>
                                {o.sigla} - {o.descricao}
                              </option>
                            ))}
                          </select>
                          {selectedOrganFilterCargo && (
                            <button 
                              onClick={() => setSelectedOrganFilterCargo('')}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold ml-1 hover:underline whitespace-nowrap"
                              title="Limpar filtro de órgão"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedStructureOrgan(null);
                          setCargoSelectedOrganId(selectedOrganFilterCargo || '');
                          setCargoFormData({ id: '', descricao: '', sigla: '', idArea: '', gestor: false });
                          setCargoFormError(null);
                          setIsNewCargoModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                      >
                        <Plus size={14} /> Novo Cargo
                      </button>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-6 py-3">Cargo</th>
                          <th className="px-6 py-3">Órgão</th>
                          <th className="px-6 py-3">Área Vinculada</th>
                          <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cargosList
                          .filter(cargo => {
                            if (!selectedOrganFilterCargo) return true;
                            const area = areasList.find(a => a.id === cargo.idArea);
                            const organId = area?.idOrgao || cargo.idOrgao;
                            return organId === selectedOrganFilterCargo;
                          })
                          .map(cargo => {
                            const area = areasList.find(a => a.id === cargo.idArea);
                            const organ = organsList.find(o => o.id === (area?.idOrgao || cargo.idOrgao));
                            return (
                              <tr key={cargo.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <span>{cargo.descricao}</span>
                                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{cargo.sigla}</span>
                                    {cargo.gestor && (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Chefia</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">
                                  {organ ? (
                                    <span>
                                      <span className="font-bold text-slate-800 text-xs">{organ.sigla}</span>
                                      <span className="text-xs text-slate-400 block truncate max-w-xs">{organ.descricao}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-xs">Não vinculado</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic text-xs">
                                  {area ? `${area.descricao} (${area.sigla})` : 'Sem área'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => { 
                                      setSelectedStructureOrgan(null);
                                      const linkedArea = areasList.find(a => a.id === cargo.idArea);
                                      setCargoSelectedOrganId(linkedArea?.idOrgao || cargo.idOrgao || '');
                                      setCargoFormData(cargo); 
                                      setCargoFormError(null); 
                                      setIsNewCargoModalOpen(true); 
                                    }} 
                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                                  >
                                    Editar
                                  </button>
                                  <button onClick={() => { setCargoToDelete(cargo); setIsConfirmDeleteCargoOpen(true); }} className="text-rose-600 hover:text-rose-800 font-bold text-xs ml-3">Excluir</button>
                                </td>
                              </tr>
                            );
                          })}
                        {cargosList.filter(cargo => {
                          if (!selectedOrganFilterCargo) return true;
                          const area = areasList.find(a => a.id === cargo.idArea);
                          const organId = area?.idOrgao || cargo.idOrgao;
                          return organId === selectedOrganFilterCargo;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                              <Briefcase size={36} className="mx-auto mb-2 opacity-30 text-slate-400" />
                              <p className="font-semibold text-slate-700 text-sm">Nenhum cargo encontrado para este órgão.</p>
                              <p className="text-xs text-slate-400 mt-1">Cadastre um novo cargo vinculado às áreas deste órgão.</p>
                              <button
                                onClick={() => {
                                  setSelectedStructureOrgan(null);
                                  setCargoSelectedOrganId(selectedOrganFilterCargo || '');
                                  setCargoFormData({ id: '', descricao: '', sigla: '', idArea: '', gestor: false });
                                  setCargoFormError(null);
                                  setIsNewCargoModalOpen(true);
                                }}
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                              >
                                <Plus size={13} /> Cadastrar Novo Cargo
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              )}
            </div>
          )}
          {activeTab === 'nomeacoes' && (
            <div className="space-y-6">
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 text-slate-900 font-bold text-lg">
                  <Filter className="text-blue-600" size={20} />
                  Filtros Avançados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Servidor</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Nome ou Matrícula" 
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Órgão</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors appearance-none"
                      value={filterOrgan}
                      onChange={(e) => { setFilterOrgan(e.target.value); setFilterArea(''); }}
                    >
                      <option value="">Todos os Órgãos</option>
                      {organsList.map(o => <option key={o.id} value={o.sigla}>{o.sigla}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Área</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors appearance-none disabled:opacity-50"
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      disabled={!filterOrgan}
                    >
                      <option value="">Todas as Áreas</option>
                      {filterOrgan && areasList
                        .filter(a => a.idOrgao === organsList.find(o => o.sigla === filterOrgan)?.id)
                        .map(a => <option key={a.id} value={a.descricao}>{a.descricao}</option>)
                      }
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors appearance-none"
                      value={filterCargo}
                      onChange={(e) => setFilterCargo(e.target.value)}
                    >
                      <option value="">Todos os Cargos</option>
                      {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors appearance-none"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">Todos os Status</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => { setFilterOrgan(''); setFilterArea(''); setFilterCargo(''); setFilterStatus(''); setFilterSearch(''); }}
                    className="text-xs text-slate-500 font-bold hover:text-slate-900 transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    Limpar Filtros
                  </button>
                </div>
              </section>

              <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">Listagem de Nomeações</h3>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">{filteredNominations.length} REGISTROS</span>
                  </div>
                  <button onClick={() => setIsNewModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    Nova Nomeação
                  </button>
                </div>
                <div className="overflow-x-auto flex-grow">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E2E8F0] uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Dados do Servidor</th>
                        <th className="px-6 py-4">Lotação / Cargo</th>
                        <th className="px-6 py-4">Data DOE</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic">
                      {filteredNominations.length > 0 ? filteredNominations.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-5 not-italic">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{row.name}</div>
                            <div className="text-[11px] text-[#94A3B8] font-mono">MATRÍCULA: {row.registration}</div>
                          </td>
                          <td className="px-6 py-5 not-italic">
                            <div className="text-slate-600 font-semibold">{row.organ}</div>
                            <div className="text-[11px] text-slate-400">{row.cargo} - {row.area}</div>
                          </td>
                          <td className="px-6 py-5 not-italic">
                            <div className="text-slate-600 font-mono text-xs">{row.date_doe || '---'}</div>
                          </td>
                          <td className="px-6 py-5 not-italic">
                            <Badge status={row.status} />
                          </td>
                          <td className="px-6 py-5 not-italic text-center">
                            <button className="bg-slate-100 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all transition-colors">
                              Detalhes
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                             Nenhum registro encontrado para os filtros selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'auditoria' && (
            <div className="space-y-6">
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                    <History size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Histórico Funcional do Servidor</h2>
                  <p className="text-slate-500 text-sm mt-2 max-w-md">
                    Consulte a trajetória completa do servidor, visualizando cada ato de nomeação e exoneração em ordem cronológica.
                  </p>
                </div>

                <div className="flex gap-3 mb-10 max-w-lg mx-auto">
                  <div className="flex-grow relative">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Busque por Nome ou Matrícula..." 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchHistory()}
                    />
                  </div>
                  <button 
                    onClick={handleSearchHistory}
                    className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    Buscar
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {selectedServidorHistory ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-8"
                    >
                      {selectedServidorHistory.length > 0 ? (
                        <>
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                              <UserCircle size={32} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{selectedServidorHistory[0].name}</h3>
                              <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">Matrícula: {historySearchTerm}</p>
                            </div>
                            <div className="ml-auto">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Cadastro Ativo</span>
                            </div>
                          </div>

                          <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {selectedServidorHistory.map((item, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={item.id} 
                                className="relative bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                              >
                                <div className={`absolute -left-[2.15rem] top-5 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm ${
                                  item.type === 'NOMINATION' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}>
                                  {item.type === 'NOMINATION' ? <CheckCircle2 size={12} className="text-white" /> : <UserMinus size={12} className="text-white" />}
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                      item.type === 'NOMINATION' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                      {item.type === 'NOMINATION' ? 'Nomeação' : 'Exoneração'}
                                    </span>
                                    <h4 className="font-bold text-slate-900 mt-2 text-base">{item.organ}</h4>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                                      <Calendar size={14} className="text-slate-400" />
                                      {item.date}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-1 uppercase">Ato: {item.ato}</div>
                                  </div>
                                </div>
                                <div className="flex gap-8 text-sm pt-3 border-t border-slate-50">
                                  <div>
                                    <span className="text-[11px] text-slate-400 font-bold block uppercase mb-1">Cargo</span>
                                    <span className="text-slate-700 font-semibold">{item.cargo}</span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] text-slate-400 font-bold block uppercase mb-1">Status Atuall</span>
                                    <span className="text-slate-700 font-semibold">Concluído</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                            <Search size={24} className="text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold">Nenhum histórico encontrado para esta busca.</p>
                          <p className="text-slate-300 text-sm">Verifique se o nome ou matrícula estão corretos.</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                       <p className="text-slate-400 font-medium">Inicie uma busca para visualizar o histórico funcional.</p>
                    </div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Nomination Modal */}
      <Modal 
        isOpen={isNewModalOpen} 
        onClose={() => { setIsNewModalOpen(false); setFormError(null); }} 
        onSave={handleSaveNomination}
        title="Nova Nomeação de Servidor" 
        errorMessage={formError}
      >
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSaveNomination(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Seção Dados Básicos */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 border-b border-blue-50 pb-2">
                <UserCircle size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Identificação do Servidor</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome completo" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Matrícula</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 12345-6" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.registration}
                      onChange={(e) => setFormData({...formData, registration: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Servidor</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.typeServidor}
                      onChange={(e) => setFormData({...formData, typeServidor: e.target.value})}
                    >
                      <option>Efetivo</option>
                      <option>Comissionado</option>
                      <option>Estagiário</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lotação (Descrição Livre)</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ex: Gerência de TI / Coordenadoria Regional" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.lotacao}
                    onChange={(e) => setFormData({...formData, lotacao: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Seção Estrutura e Atos */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 border-b border-blue-50 pb-2">
                <Layers size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Estrutura e Dados Legais</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data SEA</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.dataSea}
                      onChange={(e) => setFormData({...formData, dataSea: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data DOE</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.dataDoe}
                      onChange={(e) => setFormData({...formData, dataDoe: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número do Ato</label>
                    <input 
                      type="text" 
                      placeholder="Ex: ATO 0442/2024" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.numeroAto}
                      onChange={(e) => setFormData({...formData, numeroAto: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Inicial</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option>Aguardando DOE</option>
                      <option>Publicado</option>
                      <option>Em Análise</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider h-[1px] bg-slate-100"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Building2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Alocação Administrativa</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Órgão *</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-semibold text-slate-900"
                      value={formData.organ}
                      onChange={(e) => {
                        const organ = organsList.find(o => o.sigla === e.target.value);
                        setFormData({...formData, organ: e.target.value, area: '', lotacao: organ ? organ.tipo : ''});
                      }}
                    >
                      <option value="">Selecione o Órgão</option>
                      {organsList.map(o => <option key={o.id} value={o.sigla}>{o.sigla} - {o.descricao}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Órgão</label>
                    <select 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-bold text-blue-600"
                      value={formData.lotacao}
                      onChange={(e) => setFormData({...formData, lotacao: e.target.value})}
                    >
                      <option value="">Selecione o Tipo</option>
                      {tiposOrgaoList.map(t => (
                        <option key={t.id} value={t.descricao}>{t.descricao}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Área / Subdivisão</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    disabled={!formData.organ}
                  >
                    <option value="">Selecione a Área</option>
                    {formData.organ && areasList
                      .filter(a => a.idOrgao === organsList.find(o => o.sigla === formData.organ)?.id)
                      .map(a => (
                        <option key={a.id} value={a.descricao}>{a.descricao}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Briefcase size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cargo e Carreira</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  >
                    <option value="">Selecione o Cargo</option>
                    {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nível / Classe</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                   {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <MapPin size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Regionalização</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Município de Exercício</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.municipio}
                    onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                  >
                    {municipiosList.map(m => (
                      <option key={m.id} value={m.descricao}>{m.descricao}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Associação Regional</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                    value={formData.associacao}
                    onChange={(e) => setFormData({...formData, associacao: e.target.value})}
                  >
                    <option>GRANFPOLIS</option>
                    <option>AMREC</option>
                    <option>AMESC</option>
                    <option>AMVALI</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
             <AlertCircle className="text-amber-500 shrink-0" size={20} />
             <div className="text-xs text-amber-700 leading-relaxed font-medium">
               <strong>Verificação de Integridade em Tempo Real:</strong> O sistema bloqueia automaticamente nomeações se o servidor já possuir vínculo ativo no órgão desejado.
             </div>
          </div>
        </form>
      </Modal>
      
      {/* Organ Modal */}
      {/* Modal Municípios */}
      <Modal 
        isOpen={isNewMunicipioModalOpen} 
        onClose={() => setIsNewMunicipioModalOpen(false)} 
        onSave={handleSaveMunicipio}
        title={municipioFormData.id ? "Editar Município" : "Novo Município"}
        errorMessage={municipioFormError}
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveMunicipio(); }}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descrição *</label>
            <input 
              type="text" 
              placeholder="Ex: Florianópolis" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
              value={municipioFormData.descricao}
              onChange={(e) => setMunicipioFormData({...municipioFormData, descricao: e.target.value})}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Deletar Município */}
      <Modal 
        isOpen={isConfirmDeleteMunicipioOpen} 
        onClose={() => setIsConfirmDeleteMunicipioOpen(false)} 
        onSave={() => { setMunicipiosList(prev => prev.filter(m => m.id !== municipioToDelete?.id)); setIsConfirmDeleteMunicipioOpen(false); }}
        title="Excluir Município"
        actionLabel="Excluir Município"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
          <p className="text-sm text-slate-600">Deseja realmente excluir o município <span className="font-bold text-slate-900">"{municipioToDelete?.descricao}"</span>?</p>
        </div>
      </Modal>

      {/* Modal Tipos de Órgão */}
      <Modal 
        isOpen={isNewTipoOrgaoModalOpen} 
        onClose={() => setIsNewTipoOrgaoModalOpen(false)} 
        onSave={handleSaveTipoOrgao}
        title={tipoOrgaoFormData.id ? "Editar Tipo de Órgão" : "Novo Tipo de Órgão"}
        errorMessage={tipoOrgaoFormError}
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveTipoOrgao(); }}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descrição do Tipo *</label>
            <input 
              type="text" 
              placeholder="Ex: Centrais" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors uppercase font-mono"
              value={tipoOrgaoFormData.descricao}
              onChange={(e) => setTipoOrgaoFormData({...tipoOrgaoFormData, descricao: e.target.value})}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Deletar Tipo de Órgão */}
      <Modal 
        isOpen={isConfirmDeleteTipoOrgaoOpen} 
        onClose={() => setIsConfirmDeleteTipoOrgaoOpen(false)} 
        onSave={() => { setTiposOrgaoList(prev => prev.filter(t => t.id !== tipoOrgaoToDelete?.id)); setIsConfirmDeleteTipoOrgaoOpen(false); }}
        title="Excluir Tipo de Órgão"
        actionLabel="Excluir Tipo"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
          <p className="text-sm text-slate-600">Deseja realmente excluir o tipo de órgão <span className="font-bold text-slate-900">"{tipoOrgaoToDelete?.descricao}"</span>?</p>
        </div>
      </Modal>

      {/* Structure Management Modal */}
      <Modal 
        isOpen={isStructureModalOpen} 
        onClose={() => {
          setIsStructureModalOpen(false);
          setStructureSearchTerm('');
          handleDragEnd();
        }} 
        title={`Estrutura de Unidades - ${selectedStructureOrgan?.sigla || ''} (${selectedStructureOrgan?.descricao || ''})`} 
        actionLabel="none"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-5">
          {/* Real-time Auto-Save Toast Alert */}
          <AnimatePresence>
            {structureToast && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-600/20"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold">{structureToast.message}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white/95 shrink-0">
                  Salvo automaticamente
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Organ Overview Summary Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
                {selectedStructureOrgan?.sigla || 'ORG'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base">{selectedStructureOrgan?.descricao}</h3>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {selectedStructureOrgan?.tipo}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Layers size={13} className="text-blue-500" />
                    <strong>{areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).length}</strong> Áreas vinculadas
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-blue-500" />
                    <strong>{cargosList.filter(c => areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).some(a => a.id === c.idArea)).length}</strong> Cargos totais
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => { 
                  setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: selectedStructureOrgan?.id || '' }); 
                  setAreaFormError(null);
                  setIsNewAreaModalOpen(true); 
                }}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} /> Nova Área
              </button>
            </div>
          </div>

          {/* Explanatory banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3 text-blue-900 text-xs">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-950">Movimentação Hierárquica por Drag and Drop:</p>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                • <strong>Reordenar Áreas:</strong> Clique e arraste pela alça (<strong>⋮⋮</strong>) para reorganizar a ordem das Áreas. <span className="font-semibold text-blue-950 underline decoration-blue-300">Todos os cargos vinculados acompanham a Área na nova posição</span>.
                <br />
                • <strong>Movimentar Cargos:</strong> Arraste um Cargo para reordenar dentro da mesma Área ou solte em outra Área para transferi-lo. As novas vinculações e ordens são salvas imediatamente.
              </p>
            </div>
          </div>

          {/* Quick Filter Search within Modal */}
          {areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar áreas ou cargos nesta estrutura..."
                  value={structureSearchTerm}
                  onChange={(e) => setStructureSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400 focus:bg-white transition-all text-slate-800"
                />
                {structureSearchTerm && (
                  <button 
                    onClick={() => setStructureSearchTerm('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button 
                type="button"
                onClick={() => {
                  const organAreas = areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id);
                  if (collapsedAreaIds.size === organAreas.length) {
                    setCollapsedAreaIds(new Set());
                  } else {
                    setCollapsedAreaIds(new Set(organAreas.map(a => a.id)));
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors shrink-0"
              >
                {collapsedAreaIds.size === areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).length ? 'Expandir Todas' : 'Recolher Todas'}
              </button>
            </div>
          )}

          {/* Hierarchical Area and Cargo List with Drag and Drop */}
          <div className="space-y-4">
            {(() => {
              const currentOrganId = selectedStructureOrgan?.id;
              const organAreas = areasList.filter(a => a.idOrgao === currentOrganId);
              const filteredAreas = organAreas.filter(area => {
                if (!structureSearchTerm) return true;
                const term = structureSearchTerm.toLowerCase();
                const matchArea = area.descricao.toLowerCase().includes(term) || area.sigla.toLowerCase().includes(term);
                const matchCargo = cargosList.some(c => c.idArea === area.id && (c.descricao.toLowerCase().includes(term) || c.sigla.toLowerCase().includes(term)));
                return matchArea || matchCargo;
              });

              if (organAreas.length === 0) {
                return (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Layers size={32} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">Nenhuma área cadastrada neste órgão</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Para começar a organizar a hierarquia deste órgão, cadastre a primeira área de atuação.
                    </p>
                    <button 
                      type="button"
                      onClick={() => { 
                        setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: selectedStructureOrgan?.id || '' }); 
                        setAreaFormError(null);
                        setIsNewAreaModalOpen(true); 
                      }}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Plus size={15} /> Cadastrar Primeira Área
                    </button>
                  </div>
                );
              }

              if (filteredAreas.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    <Search size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm text-slate-600">Nenhum resultado encontrado</p>
                    <p className="text-xs">Não encontramos áreas ou cargos com o termo "{structureSearchTerm}".</p>
                  </div>
                );
              }

              return filteredAreas.map((area) => {
                const areaCargos = cargosList.filter(c => c.idArea === area.id);
                const isDraggingArea = draggedItem?.type === 'area' && draggedItem.areaId === area.id;
                const isCollapsed = collapsedAreaIds.has(area.id);
                const areaSeq = organAreas.findIndex(a => a.id === area.id) + 1;

                return (
                  <div key={area.id} className="relative">
                    {/* Area Drop Indicator (Before) */}
                    {dragOverArea?.id === area.id && dragOverArea?.position === 'before' && (
                      <div className="flex items-center gap-2 py-1.5 animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-sm" />
                        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent rounded-full flex-1 shadow-sm" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Mover Área para cá</span>
                      </div>
                    )}

                    {/* Area Card */}
                    <div 
                      onDragOver={(e) => handleAreaDragOver(e, area.id)}
                      onDragLeave={(e) => handleAreaDragLeave(e, area.id)}
                      onDrop={(e) => handleAreaDrop(e, area.id)}
                      className={`border rounded-2xl overflow-hidden transition-all duration-150 ${
                        isDraggingArea 
                          ? 'opacity-40 border-dashed border-2 border-blue-500 bg-blue-50/40 shadow-none' 
                          : dragOverArea?.id === area.id
                            ? 'border-blue-400 ring-2 ring-blue-400/30 bg-white shadow-md'
                            : 'border-slate-200/90 bg-white shadow-xs hover:border-slate-300'
                      }`}
                    >
                      {/* Area Header with Drag Handle */}
                      <div className="bg-slate-50/90 p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Drag handle for the Area */}
                          <div 
                            draggable
                            onDragStart={(e) => handleAreaDragStart(e, area.id)}
                            onDragEnd={handleDragEnd}
                            title="Clique e arraste para reordenar esta Área (todos os cargos acompanham)"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-grab active:cursor-grabbing transition-colors shrink-0"
                          >
                            <GripVertical size={16} />
                          </div>

                          {/* Sequence position */}
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                            #{areaSeq}
                          </span>

                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Layers size={14} />
                          </div>

                          <div className="truncate">
                            <span className="font-bold text-slate-900 text-sm">{area.descricao}</span>
                            <span className="ml-2 font-mono text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 uppercase">
                              {area.sigla}
                            </span>
                          </div>

                          <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shrink-0">
                            {areaCargos.length} {areaCargos.length === 1 ? 'cargo vinculado' : 'cargos vinculados'}
                          </span>
                        </div>

                        {/* Actions for Area */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => { 
                              setCargoSelectedOrganId(area.idOrgao || selectedStructureOrgan?.id || '');
                              setCargoFormData({ id: '', descricao: '', sigla: '', idArea: area.id, gestor: false, idOrgao: area.idOrgao || selectedStructureOrgan?.id || '' }); 
                              setCargoFormError(null);
                              setIsNewCargoModalOpen(true); 
                            }}
                            className="bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Plus size={13} className="text-blue-600" /> Adicionar Cargo
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setAreaFormData(area); setIsNewAreaModalOpen(true); }}
                            title="Editar Área"
                            className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setAreaToDelete(area); setIsConfirmDeleteAreaOpen(true); }}
                            title="Excluir Área"
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => toggleAreaCollapse(area.id)}
                            title={isCollapsed ? "Expandir cargos" : "Recolher cargos"}
                            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Area Body: Hierarchical tree branch of Cargos */}
                      {!isCollapsed && (
                        <div 
                          onDragOver={(e) => {
                            if (draggedItem?.type === 'cargo' && draggedItem.sourceAreaId !== area.id) {
                              e.preventDefault();
                              setDragOverAreaContainerId(area.id);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverAreaContainerId === area.id) setDragOverAreaContainerId(null);
                          }}
                          onDrop={(e) => {
                            if (draggedItem?.type === 'cargo') {
                              handleCargoDropOnArea(e, area.id);
                            }
                          }}
                          className={`p-4 transition-colors ${
                            dragOverAreaContainerId === area.id 
                              ? 'bg-blue-50/40 ring-2 ring-inset ring-blue-300' 
                              : 'bg-white'
                          }`}
                        >
                          <div className="border-l-2 border-slate-200 ml-3 pl-4 space-y-2.5">
                            {areaCargos.map((cargo) => {
                              const isDraggingCargo = draggedItem?.type === 'cargo' && draggedItem.cargoId === cargo.id;
                              return (
                                <div key={cargo.id} className="relative">
                                  {/* Cargo Drop line before */}
                                  {dragOverCargo?.cargoId === cargo.id && dragOverCargo?.position === 'before' && (
                                    <div className="flex items-center gap-1.5 py-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                                      <div className="h-0.5 bg-blue-500 rounded-full flex-1" />
                                    </div>
                                  )}

                                  {/* Cargo Card */}
                                  <div 
                                    onDragOver={(e) => handleCargoDragOver(e, cargo.id, area.id)}
                                    onDragLeave={(e) => handleCargoDragLeave(e, cargo.id)}
                                    onDrop={(e) => handleCargoDropOnCargo(e, cargo.id, area.id)}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 group/cargo ${
                                      isDraggingCargo 
                                        ? 'opacity-40 border-dashed border-blue-400 bg-blue-50'
                                        : dragOverCargo?.cargoId === cargo.id
                                          ? 'border-blue-400 bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                                          : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {/* Grip handle for Cargo */}
                                      <div 
                                        draggable
                                        onDragStart={(e) => handleCargoDragStart(e, cargo.id, area.id)}
                                        onDragEnd={handleDragEnd}
                                        title="Clique e arraste para reordenar ou transferir para outra Área"
                                        className="p-1 text-slate-300 group-hover/cargo:text-slate-600 hover:bg-slate-200/80 rounded-md cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                      >
                                        <GripVertical size={14} />
                                      </div>

                                      {/* Tree connection indicator node */}
                                      <div className="w-2 h-2 rounded-full bg-slate-300 group-hover/cargo:bg-blue-500 shrink-0 transition-colors" />

                                      {/* Gestor / Operacional tag */}
                                      {cargo.gestor ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                          <ShieldCheck size={11} className="text-amber-600" /> Chefia / Gestão
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                          Operacional
                                        </span>
                                      )}

                                      {/* Description & Sigla */}
                                      <div className="truncate flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-800">{cargo.descricao}</span>
                                        <span className="text-[10px] font-mono text-slate-500 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                                          {cargo.sigla}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Cargo Actions */}
                                    <div className="flex items-center gap-1 opacity-80 group-hover/cargo:opacity-100 transition-opacity shrink-0">
                                      <button 
                                        type="button"
                                        onClick={() => { 
                                          setCargoSelectedOrganId(area.idOrgao || selectedStructureOrgan?.id || '');
                                          setCargoFormData(cargo); 
                                          setCargoFormError(null);
                                          setIsNewCargoModalOpen(true); 
                                        }} 
                                        title="Editar Cargo"
                                        className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => { setCargoToDelete(cargo); setIsConfirmDeleteCargoOpen(true); }} 
                                        title="Excluir Cargo"
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Cargo Drop line after */}
                                  {dragOverCargo?.cargoId === cargo.id && dragOverCargo?.position === 'after' && (
                                    <div className="flex items-center gap-1.5 py-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                                      <div className="h-0.5 bg-blue-500 rounded-full flex-1" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Empty state inside Area if no cargos */}
                            {areaCargos.length === 0 && (
                              <div 
                                onDragOver={(e) => {
                                  if (draggedItem?.type === 'cargo') {
                                    e.preventDefault();
                                    setDragOverAreaContainerId(area.id);
                                  }
                                }}
                                onDrop={(e) => {
                                  if (draggedItem?.type === 'cargo') {
                                    handleCargoDropOnArea(e, area.id);
                                  }
                                }}
                                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                                  dragOverAreaContainerId === area.id 
                                    ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm' 
                                    : 'border-slate-200 bg-slate-50/40 text-slate-400'
                                }`}
                              >
                                <Briefcase size={20} className="mx-auto mb-1.5 opacity-40" />
                                <p className="text-xs font-semibold">Nenhum cargo cadastrado nesta área</p>
                                <p className="text-[11px] mt-0.5">
                                  Arraste um cargo aqui para vinculá-lo a esta área, ou{' '}
                                  <button 
                                    type="button"
                                    onClick={() => { 
                                      setCargoSelectedOrganId(area.idOrgao || selectedStructureOrgan?.id || '');
                                      setCargoFormData({ id: '', descricao: '', sigla: '', idArea: area.id, gestor: false, idOrgao: area.idOrgao || selectedStructureOrgan?.id || '' }); 
                                      setCargoFormError(null);
                                      setIsNewCargoModalOpen(true); 
                                    }}
                                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                                  >
                                    adicione um novo cargo
                                  </button>.
                                </p>
                              </div>
                            )}

                            {/* Drop slot at end of area if a cargo from another area is currently dragged */}
                            {draggedItem?.type === 'cargo' && draggedItem.sourceAreaId !== area.id && areaCargos.length > 0 && (
                              <div 
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDragOverAreaContainerId(area.id);
                                }}
                                onDrop={(e) => handleCargoDropOnArea(e, area.id)}
                                className={`border border-dashed rounded-lg py-2 px-3 text-center text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  dragOverAreaContainerId === area.id 
                                    ? 'border-blue-500 bg-blue-100/60 text-blue-700 font-bold' 
                                    : 'border-blue-200 bg-blue-50/30 text-blue-600 hover:bg-blue-50'
                                }`}
                              >
                                <ArrowRight size={13} /> Solte aqui para transferir para o final desta área ({area.sigla})
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Area Drop Indicator (After) */}
                    {dragOverArea?.id === area.id && dragOverArea?.position === 'after' && (
                      <div className="flex items-center gap-2 py-1.5 animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-sm" />
                        <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent rounded-full flex-1 shadow-sm" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Mover Área para cá</span>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Modal>

      {/* Area Modal */}
      <Modal 
        isOpen={isNewAreaModalOpen} 
        onClose={() => { setIsNewAreaModalOpen(false); setAreaFormError(null); }} 
        onSave={handleSaveArea}
        title={areaFormData.id ? "Editar Área" : "Nova Área de Atuação"} 
        errorMessage={areaFormError}
      >
         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveArea(); }}>
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-500 uppercase">Órgão Vinculado *</label>
               <select 
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                 value={areaFormData.idOrgao}
                 onChange={(e) => setAreaFormData({ ...areaFormData, idOrgao: e.target.value })}
               >
                  <option value="">Selecione o Órgão</option>
                  {organsList.map(o => (
                     <option key={o.id} value={o.id}>{o.sigla} - {o.descricao}</option>
                  ))}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-500 uppercase">Descrição da Área *</label>
               <input 
                 type="text" 
                 placeholder="Ex: Gerência de Recursos Humanos"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                 value={areaFormData.descricao}
                 onChange={(e) => setAreaFormData({ ...areaFormData, descricao: e.target.value })}
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-500 uppercase">Sigla *</label>
               <input 
                 type="text" 
                 placeholder="Ex: GRH"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors uppercase font-mono"
                 value={areaFormData.sigla}
                 onChange={(e) => setAreaFormData({ ...areaFormData, sigla: e.target.value.toUpperCase() })}
               />
            </div>
         </form>
      </Modal>

      {/* Cargo Modal */}
      <Modal 
        isOpen={isNewCargoModalOpen} 
        onClose={() => { 
          setIsNewCargoModalOpen(false); 
          setCargoFormError(null); 
          setCargoSelectedOrganId('');
        }} 
        onSave={handleSaveCargo}
        title={cargoFormData.id ? "Editar Cargo" : "Novo Cargo Financeiro/Administrativo"} 
        errorMessage={cargoFormError}
      >
         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveCargo(); }}>
            {/* Campo de seleção de Órgão acima de Área Relacionada */}
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Órgão *</label>
               <select 
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-medium text-slate-900"
                 value={cargoSelectedOrganId}
                 onChange={(e) => {
                   const newOrganId = e.target.value;
                   setCargoSelectedOrganId(newOrganId);
                   // Filtra automaticamente as áreas vinculadas com o órgão para o campo "Área Relacionada"
                   const currentArea = areasList.find(a => a.id === cargoFormData.idArea);
                   if (!currentArea || currentArea.idOrgao !== newOrganId) {
                     setCargoFormData(prev => ({ ...prev, idArea: '', idOrgao: newOrganId }));
                   } else {
                     setCargoFormData(prev => ({ ...prev, idOrgao: newOrganId }));
                   }
                 }}
               >
                  <option value="">Selecione o Órgão</option>
                  {organsList.map(o => (
                     <option key={o.id} value={o.id}>
                       {o.sigla} - {o.descricao}
                     </option>
                  ))}
               </select>
            </div>

            {/* Campo Área Relacionada filtrada dinamicamente pelo Órgão selecionado */}
            <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Área Relacionada *</label>
                 {cargoSelectedOrganId && (
                   <span className="text-[10px] text-blue-600 font-semibold">
                     {areasList.filter(a => a.idOrgao === cargoSelectedOrganId).length} área(s) vinculada(s)
                   </span>
                 )}
               </div>
               <select 
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed font-medium text-slate-900"
                 value={cargoFormData.idArea}
                 onChange={(e) => setCargoFormData({ ...cargoFormData, idArea: e.target.value })}
                 disabled={!cargoSelectedOrganId}
               >
                  <option value="">
                    {!cargoSelectedOrganId 
                      ? "Selecione primeiro o Órgão acima" 
                      : (areasList.filter(a => a.idOrgao === cargoSelectedOrganId).length === 0 
                          ? "Nenhuma área vinculada a este órgão" 
                          : "Selecione a Área Relacionada")}
                  </option>
                  {cargoSelectedOrganId && areasList
                    .filter(a => a.idOrgao === cargoSelectedOrganId)
                    .map(a => (
                       <option key={a.id} value={a.id}>
                         {a.descricao} ({a.sigla})
                       </option>
                    ))
                  }
               </select>
               {cargoSelectedOrganId && areasList.filter(a => a.idOrgao === cargoSelectedOrganId).length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                     Este órgão ainda não possui áreas cadastradas. Cadastre primeiro uma área para este órgão na aba "Áreas".
                  </p>
               )}
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-slate-500 uppercase">Descrição do Cargo *</label>
               <input 
                 type="text" 
                 placeholder="Ex: Assessor de Gabinete"
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors"
                 value={cargoFormData.descricao}
                 onChange={(e) => setCargoFormData({ ...cargoFormData, descricao: e.target.value })}
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-500 uppercase">Sigla *</label>
                 <input 
                   type="text" 
                   placeholder="Ex: AG"
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors uppercase font-mono"
                   value={cargoFormData.sigla}
                   onChange={(e) => setCargoFormData({ ...cargoFormData, sigla: e.target.value.toUpperCase() })}
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-500 uppercase">Cargo de Gestão?</label>
                 <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={cargoFormData.gestor}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, gestor: e.target.checked })}
                    />
                    <span className="text-sm text-slate-600">Sim, possui cargo de chefia</span>
                 </div>
              </div>
            </div>
         </form>
      </Modal>

      {/* Delete Confirmation Modals */}
      <Modal 
        isOpen={isConfirmDeleteAreaOpen} 
        onClose={() => setIsConfirmDeleteAreaOpen(false)} 
        onSave={() => { setAreasList(prev => prev.filter(a => a.id !== areaToDelete?.id)); setIsConfirmDeleteAreaOpen(false); }}
        title="Excluir Área" 
        actionLabel="Excluir Área"
      >
         <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
            <p className="text-sm text-slate-600">Deseja realmente excluir a área <span className="font-bold text-slate-900">"{areaToDelete?.descricao}"</span>?</p>
            <p className="text-[10px] text-rose-500 font-bold uppercase italic">Atenção: Todos os cargos vinculados serão desconectados.</p>
         </div>
      </Modal>

      <Modal 
        isOpen={isConfirmDeleteCargoOpen} 
        onClose={() => setIsConfirmDeleteCargoOpen(false)} 
        onSave={() => { setCargosList(prev => prev.filter(c => c.id !== cargoToDelete?.id)); setIsConfirmDeleteCargoOpen(false); }}
        title="Excluir Cargo" 
        actionLabel="Excluir Cargo"
      >
         <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
            <p className="text-sm text-slate-600">Deseja realmente excluir o cargo <span className="font-bold text-slate-900">"{cargoToDelete?.descricao}"</span>?</p>
         </div>
      </Modal>

      <Modal 
        isOpen={isNewOrganModalOpen} 
        onClose={() => { setIsNewOrganModalOpen(false); setOrganFormError(null); }} 
        onSave={handleSaveOrgan}
        title={organFormData.id ? "Editar Órgão" : "Cadastro de Novo Órgão"} 
        errorMessage={organFormError}
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveOrgan(); }}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Descrição do Órgão</label>
              <input 
                type="text" 
                placeholder="Ex: Secretaria de Estado da Fazenda" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-medium text-slate-900"
                value={organFormData.descricao}
                onChange={(e) => setOrganFormData({...organFormData, descricao: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sigla</label>
                <input 
                  type="text" 
                  placeholder="Ex: SEF" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors uppercase font-bold text-slate-900"
                  value={organFormData.sigla}
                  onChange={(e) => setOrganFormData({...organFormData, sigla: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo do Órgão</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-bold text-slate-700"
                  value={organFormData.tipo}
                  onChange={(e) => setOrganFormData({...organFormData, tipo: e.target.value})}
                >
                  <option>Centrais</option>
                  <option>Entidades</option>
                  <option>Gab Gov</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sequência Administrativa</label>
              <input 
                type="number" 
                placeholder="Ex: 10" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors font-mono text-slate-900"
                value={organFormData.sequencia}
                onChange={(e) => setOrganFormData({...organFormData, sequencia: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
             <Building2 className="text-blue-500 shrink-0" size={20} />
             <div className="text-[11px] text-blue-700 leading-relaxed font-medium">
               {organFormData.id ? "Alterações na sigla ou descrição serão refletidas em todos os registros vinculados a este órgão." : "A correta classificação do tipo de órgão influencia diretamente na hierarquia das áreas e cargos vinculados."}
             </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isConfirmDeleteOpen} 
        onClose={() => setIsConfirmDeleteOpen(false)} 
        onSave={handleConfirmDelete}
        title="Confirmar Exclusão"
        actionLabel="Excluir Órgão"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
              <Trash2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Excluir órgão {organToDelete?.sigla}?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Você está prestes a realizar a exclusão lógica do órgão <br/>
              <span className="font-bold text-slate-900">"{organToDelete?.descricao}"</span>. <br/>
              Esta ação manterá a integridade dos dados históricos, mas o órgão não estará mais disponível para novas nomeações.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              A exclusão só será permitida se não houverem nomeações ATIVAS vinculadas a este órgão.
            </p>
          </div>
        </div>
      </Modal>

      {/* Organ Details & Areas Modal */}
      <Modal 
        isOpen={isOrganDetailsOpen} 
        onClose={() => setIsOrganDetailsOpen(false)} 
        title="Detalhes do Órgão"
        actionLabel="none"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nome Completo</span>
                <p className="text-lg font-bold text-slate-900">{selectedOrgan?.descricao}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Sigla</span>
                  <p className="text-base font-mono font-bold text-blue-600">{selectedOrgan?.sigla}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tipo</span>
                  <p className="text-base font-bold text-slate-700 uppercase">{selectedOrgan?.tipo}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status Sistema</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Ativo</span>
              </div>
            </div>
          </div>

          {selectedOrgan && (() => {
            const stats = getOrganStats(selectedOrgan);
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Áreas</span>
                  <span className="text-xl font-bold text-slate-800">{stats.areas}</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Cargos</span>
                  <span className="text-xl font-bold text-indigo-700">{stats.cargos}</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">Cargos Ocupados</span>
                  <span className="text-xl font-bold text-emerald-600">{stats.ocupados}</span>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block mb-0.5">Cargos Livres</span>
                  <span className="text-xl font-bold text-sky-600">{stats.livres}</span>
                </div>
              </div>
            );
          })()}

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers size={18} className="text-blue-500" />
              <h4 className="font-bold text-slate-900">Áreas Vinculadas</h4>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black ml-auto">
                {areasList.filter(a => a.idOrgao === selectedOrgan?.id).length} ÁREAS
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {areasList.filter(a => a.idOrgao === selectedOrgan?.id).map((area, i) => (
                <div key={area.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group">
                  <span className="text-sm font-semibold text-slate-700">{area.descricao}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>
              )) || (
                <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">Nenhuma área cadastrada para este órgão.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

