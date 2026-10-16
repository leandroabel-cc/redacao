/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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
  Info
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
  title, 
  children, 
  errorMessage,
  actionLabel = "Salvar Registro"
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: React.ReactNode, 
  errorMessage?: string | null,
  actionLabel?: string
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-x-4 top-4 bottom-4 md:inset-auto md:top-auto md:bottom-auto md:max-w-4xl w-full bg-white rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Plus className="text-blue-600" />
              {title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
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
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            {actionLabel !== "none" && (
              <button 
                onClick={(children as any).props?.onSave || onClose} 
                className={`px-8 py-2.5 rounded-xl text-white text-sm font-bold transition-shadow shadow-lg ${
                  actionLabel.includes('Excluir') 
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

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
  ]);

  const [cargosList, setCargosList] = useState<Cargo[]>([
    { id: 'c1', descricao: 'Diretor', sigla: 'DIR', idArea: 'a1', gestor: true },
    { id: 'c2', descricao: 'Gerente', sigla: 'GER', idArea: 'a1', gestor: true },
    { id: 'c3', descricao: 'Assessor Técnico', sigla: 'AT', idArea: 'a2', gestor: false },
    { id: 'c4', descricao: 'Coordenador', sigla: 'COORD', idArea: 'a4', gestor: true },
  ]);

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
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);
  const [areaFormError, setAreaFormError] = useState<string | null>(null);
  const [cargoFormError, setCargoFormError] = useState<string | null>(null);

  // Organ Management State
  const [organSearchTerm, setOrganSearchTerm] = useState('');
  const [selectedOrganIds, setSelectedOrganIds] = useState<Set<string>>(new Set());
  const [organPage, setOrganPage] = useState(1);
  const [organItemsPerPage] = useState(5);
  const [organSortField, setOrganSortField] = useState<'descricao' | 'sigla'>('descricao');
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
    return NOMINATIONS.find(n => n.registration === reg && n.organ === organ && n.status !== 'Exonerado');
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

    // In a real app, we would dispatch an API call here.
    console.log('Salvando nomeação:', formData);
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

  const toggleSort = (field: 'descricao' | 'sigla') => {
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

  const sortedAndPaginatedOrgans = useMemo(() => {
    const filtered = organsList.filter(o => 
      o.descricao.toLowerCase().includes(organSearchTerm.toLowerCase()) || 
      o.sigla.toLowerCase().includes(organSearchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const valA = a[organSortField].toLowerCase();
      const valB = b[organSortField].toLowerCase();
      if (valA < valB) return organSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return organSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const start = (organPage - 1) * organItemsPerPage;
    return sorted.slice(start, start + organItemsPerPage);
  }, [organsList, organSortField, organSortDir, organPage, organItemsPerPage, organSearchTerm]);

  const totalFilteredOrgans = useMemo(() => {
    return organsList.filter(o => 
      o.descricao.toLowerCase().includes(organSearchTerm.toLowerCase()) || 
      o.sigla.toLowerCase().includes(organSearchTerm.toLowerCase())
    ).length;
  }, [organsList, organSearchTerm]);

  const totalOrganPages = Math.ceil(totalFilteredOrgans / organItemsPerPage);

  const filteredNominations = useMemo(() => {
    return NOMINATIONS.filter(item => {
      const matchOrgan = !filterOrgan || item.organ === filterOrgan;
      const matchArea = !filterArea || item.area === filterArea;
      const matchCargo = !filterCargo || item.cargo === filterCargo;
      const matchStatus = !filterStatus || item.status === filterStatus;
      const matchSearch = !filterSearch || 
        item.name.toLowerCase().includes(filterSearch.toLowerCase()) || 
        item.registration.includes(filterSearch);
      return matchOrgan && matchArea && matchCargo && matchStatus && matchSearch;
    });
  }, [filterOrgan, filterArea, filterCargo, filterStatus, filterSearch]);

  const handleSearchHistory = () => {
    if (!historySearchTerm) return;
    const results = FUNCTIONAL_HISTORY.filter(h => 
      h.name.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
      h.servidor_id === historySearchTerm
    );
    setSelectedServidorHistory(results.length > 0 ? results : []);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-[#94A3B8] flex flex-col shrink-0 border-r border-[#1E293B]">
        <div className="p-6 flex items-center gap-3 text-[#F8FAFC] font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-black">S</div>
          <span>SGN Admin</span>
          <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded ml-auto">v1.0</span>
        </div>

        <nav className="flex-grow mt-2">
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

        <div className="p-6 text-xs opacity-50 border-t border-[#1E293B]">
          Tenant: Administração Central
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
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

        <div className="p-6 overflow-y-auto flex-grow bg-slate-50/30">
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
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Sequência</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedAndPaginatedOrgans.length > 0 ? sortedAndPaginatedOrgans.map(o => (
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
                          <td className="px-6 py-4 text-slate-500 font-mono text-center w-24">{o.sequencia.padStart(2, '0')}</td>
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
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
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
                    Mostrando <span className="font-bold text-slate-900">{sortedAndPaginatedOrgans.length}</span> de <span className="font-bold text-slate-900">{organsList.length}</span> órgãos
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setOrganPage(prev => Math.max(1, prev - 1))}
                      disabled={organPage === 1}
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
                      disabled={organPage === totalOrganPages}
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
                    <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Gestão de Áreas</h3>
                      <button 
                        onClick={() => {
                          setSelectedStructureOrgan(null);
                          setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: '' });
                          setAreaFormError(null);
                          setIsNewAreaModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
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
                        {areasList.map(area => {
                          const organ = organsList.find(o => o.id === area.idOrgao);
                          return (
                            <tr key={area.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-semibold text-slate-900">{area.descricao}</td>
                              <td className="px-6 py-4 text-slate-500">{organ ? organ.descricao : 'Não vinculado'}</td>
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
                      </tbody>
                    </table>
                 </div>
              )}

              {activeAdminTab === 'cargos' && (
                 <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Gestão de Cargos</h3>
                      <button 
                        onClick={() => {
                          setSelectedStructureOrgan(null);
                          setCargoSelectedOrganId('');
                          setCargoFormData({ id: '', descricao: '', sigla: '', idArea: '', gestor: false });
                          setCargoFormError(null);
                          setIsNewCargoModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
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
                        {cargosList.map(cargo => {
                          const area = areasList.find(a => a.id === cargo.idArea);
                          const organ = organsList.find(o => o.id === (area?.idOrgao || cargo.idOrgao));
                          return (
                            <tr key={cargo.id} className="hover:bg-slate-50">
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
                                    <span className="font-bold text-slate-800">{organ.sigla}</span>
                                    <span className="text-xs text-slate-400 block truncate max-w-xs">{organ.descricao}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Não vinculado</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500 italic">
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
      <Modal isOpen={isNewModalOpen} onClose={() => { setIsNewModalOpen(false); setFormError(null); }} title="Nova Nomeação de Servidor" errorMessage={formError}>
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()} onSave={handleSaveNomination}>
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
        title={municipioFormData.id ? "Editar Município" : "Novo Município"}
        errorMessage={municipioFormError}
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} onSave={handleSaveMunicipio}>
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
        title="Excluir Município"
        actionLabel="Excluir Município"
      >
        <div className="text-center space-y-4" onSave={() => { setMunicipiosList(prev => prev.filter(m => m.id !== municipioToDelete?.id)); setIsConfirmDeleteMunicipioOpen(false); }}>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
          <p className="text-sm text-slate-600">Deseja realmente excluir o município <span className="font-bold text-slate-900">"{municipioToDelete?.descricao}"</span>?</p>
        </div>
      </Modal>

      {/* Modal Tipos de Órgão */}
      <Modal 
        isOpen={isNewTipoOrgaoModalOpen} 
        onClose={() => setIsNewTipoOrgaoModalOpen(false)} 
        title={tipoOrgaoFormData.id ? "Editar Tipo de Órgão" : "Novo Tipo de Órgão"}
        errorMessage={tipoOrgaoFormError}
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} onSave={handleSaveTipoOrgao}>
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
        title="Excluir Tipo de Órgão"
        actionLabel="Excluir Tipo"
      >
        <div className="text-center space-y-4" onSave={() => { setTiposOrgaoList(prev => prev.filter(t => t.id !== tipoOrgaoToDelete?.id)); setIsConfirmDeleteTipoOrgaoOpen(false); }}>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
          <p className="text-sm text-slate-600">Deseja realmente excluir o tipo de órgão <span className="font-bold text-slate-900">"{tipoOrgaoToDelete?.descricao}"</span>?</p>
        </div>
      </Modal>

      {/* Structure Management Modal */}
      <Modal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} title={`Estrutura de Unidades - ${selectedStructureOrgan?.descricao}`} actionLabel="none">
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div>
               <h4 className="font-bold text-slate-900">Áreas e Departamentos</h4>
               <p className="text-xs text-slate-500">Configure a hierarquia interna deste órgão.</p>
             </div>
             <button 
               onClick={() => { setAreaFormData({ id: '', descricao: '', sigla: '', idOrgao: selectedStructureOrgan?.id || '' }); setIsNewAreaModalOpen(true); }}
               className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
             >
               <Plus size={14} /> Nova Área
             </button>
          </div>

          <div className="space-y-4">
             {areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).map(area => (
                <div key={area.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-slate-50 p-3 flex justify-between items-center border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-blue-500" />
                        <span className="font-bold text-slate-900 text-sm">{area.descricao} ({area.sigla})</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setAreaFormData(area); setIsNewAreaModalOpen(true); }} className="p-1 hover:bg-amber-100 text-amber-600 rounded transition-all"><Edit2 size={14} /></button>
                         <button onClick={() => { setAreaToDelete(area); setIsConfirmDeleteAreaOpen(true); }} className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-all"><Trash2 size={14} /></button>
                         <button 
                           onClick={() => { 
                             setCargoSelectedOrganId(area.idOrgao || selectedStructureOrgan?.id || '');
                             setCargoFormData({ id: '', descricao: '', sigla: '', idArea: area.id, gestor: false, idOrgao: area.idOrgao || selectedStructureOrgan?.id || '' }); 
                             setCargoFormError(null);
                             setIsNewCargoModalOpen(true); 
                           }}
                           className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-1"
                         >
                           <Plus size={10} /> Adicionar Cargo
                         </button>
                      </div>
                   </div>
                   <div className="p-3 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {cargosList.filter(c => c.idArea === area.id).map(cargo => (
                            <div key={cargo.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50/50 border border-slate-50 group">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${cargo.gestor ? 'bg-amber-500' : 'bg-blue-400'}`} />
                                  <span className="text-xs font-semibold text-slate-700">{cargo.descricao}</span>
                                  <span className="text-[9px] font-mono text-slate-400 uppercase">{cargo.sigla}</span>
                               </div>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={() => { 
                                      setCargoSelectedOrganId(area.idOrgao || selectedStructureOrgan?.id || '');
                                      setCargoFormData(cargo); 
                                      setCargoFormError(null);
                                      setIsNewCargoModalOpen(true); 
                                    }} 
                                    className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button onClick={() => { setCargoToDelete(cargo); setIsConfirmDeleteCargoOpen(true); }} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={12} /></button>
                               </div>
                            </div>
                         ))}
                         {cargosList.filter(c => c.idArea === area.id).length === 0 && (
                            <div className="col-span-full py-2 text-center text-slate-300 text-[11px] italic">Sem cargos cadastrados nesta área.</div>
                         )}
                      </div>
                   </div>
                </div>
             ))}
             {areasList.filter(a => a.idOrgao === selectedStructureOrgan?.id).length === 0 && (
                <div className="py-12 text-center text-slate-300">
                   <Layers size={48} className="mx-auto mb-4 opacity-10" />
                   <p className="font-bold">Nenhuma área cadastrada.</p>
                   <p className="text-xs">Comece adicionando uma área de atuação para este órgão.</p>
                </div>
             )}
          </div>
        </div>
      </Modal>

      {/* Area Modal */}
      <Modal 
        isOpen={isNewAreaModalOpen} 
        onClose={() => { setIsNewAreaModalOpen(false); setAreaFormError(null); }} 
        title={areaFormData.id ? "Editar Área" : "Nova Área de Atuação"} 
        errorMessage={areaFormError}
      >
         <form className="space-y-4" onSubmit={(e) => e.preventDefault()} onSave={handleSaveArea}>
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
        title={cargoFormData.id ? "Editar Cargo" : "Novo Cargo Financeiro/Administrativo"} 
        errorMessage={cargoFormError}
      >
         <form className="space-y-4" onSubmit={(e) => e.preventDefault()} onSave={handleSaveCargo}>
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
      <Modal isOpen={isConfirmDeleteAreaOpen} onClose={() => setIsConfirmDeleteAreaOpen(false)} title="Excluir Área" actionLabel="Excluir Área">
         <div className="text-center space-y-4" onSave={() => { setAreasList(prev => prev.filter(a => a.id !== areaToDelete?.id)); setIsConfirmDeleteAreaOpen(false); }}>
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
            <p className="text-sm text-slate-600">Deseja realmente excluir a área <span className="font-bold text-slate-900">"{areaToDelete?.descricao}"</span>?</p>
            <p className="text-[10px] text-rose-500 font-bold uppercase italic">Atenção: Todos os cargos vinculados serão desconectados.</p>
         </div>
      </Modal>

      <Modal isOpen={isConfirmDeleteCargoOpen} onClose={() => setIsConfirmDeleteCargoOpen(false)} title="Excluir Cargo" actionLabel="Excluir Cargo">
         <div className="text-center space-y-4" onSave={() => { setCargosList(prev => prev.filter(c => c.id !== cargoToDelete?.id)); setIsConfirmDeleteCargoOpen(false); }}>
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
            <p className="text-sm text-slate-600">Deseja realmente excluir o cargo <span className="font-bold text-slate-900">"{cargoToDelete?.descricao}"</span>?</p>
         </div>
      </Modal>

      {/* Modal Deletar Tipo de Órgão */}
      <Modal 
        isOpen={isConfirmDeleteTipoOrgaoOpen} 
        onClose={() => setIsConfirmDeleteTipoOrgaoOpen(false)} 
        title="Excluir Tipo de Órgão"
        actionLabel="Excluir Tipo"
      >
        <div className="text-center space-y-4" onSave={() => { setTiposOrgaoList(prev => prev.filter(t => t.id !== tipoOrgaoToDelete?.id)); setIsConfirmDeleteTipoOrgaoOpen(false); }}>
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100"><Trash2 size={32} /></div>
          <p className="text-sm text-slate-600">Deseja realmente excluir o tipo de órgão <span className="font-bold text-slate-900">"{tipoOrgaoToDelete?.descricao}"</span>?</p>
        </div>
      </Modal>

      <Modal 
        isOpen={isNewOrganModalOpen} 
        onClose={() => { setIsNewOrganModalOpen(false); setOrganFormError(null); }} 
        title={organFormData.id ? "Editar Órgão" : "Cadastro de Novo Órgão"} 
        errorMessage={organFormError}
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} onSave={handleSaveOrgan}>
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
        title="Confirmar Exclusão"
        actionLabel="Excluir Órgão"
      >
        <div className="space-y-6" onSave={handleConfirmDelete}>
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Sequência Admin</span>
                <p className="text-base font-mono font-bold text-slate-900">{selectedOrgan?.sequencia}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status Sistema</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Ativo</span>
              </div>
            </div>
          </div>

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

