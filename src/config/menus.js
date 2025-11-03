import {
  DashboardOutlined,
  TeamOutlined,
  ScheduleOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  InboxOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  BankOutlined,
  FileDoneOutlined,
  ContainerOutlined,
  BarcodeOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  FileSyncOutlined,
  AuditOutlined,
  HomeOutlined,
  HddOutlined,
  TagOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileAddOutlined,
  FileMarkdownOutlined,
  FilePptOutlined,
  FilterOutlined,
  FireOutlined,
  FlagOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  FrownOutlined,
  FunnelPlotOutlined,
  GiftOutlined,
  GoldOutlined,
  HeartOutlined,
  HistoryOutlined,
  HourglassOutlined,
  IdcardOutlined,
  ImportOutlined,
  InsertRowAboveOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  InsuranceOutlined,
  InteractionOutlined,
  KeyOutlined,
  LayoutOutlined,
  LikeOutlined,
  LinkOutlined,
  LinkedinOutlined,
  Loading3QuartersOutlined,
  LoadingOutlined,
  LockOutlined,
  LoginOutlined,
  MailOutlined,
  ManOutlined,
  MediumOutlined,
  MediumWorkmarkOutlined,
  MehOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MobileOutlined,
  MoneyCollectOutlined,
  MonitorOutlined,
  MoreOutlined,
  NodeCollapseOutlined,
  NodeExpandOutlined,
  NodeIndexOutlined,
  NotificationOutlined,
  NumberOutlined,
  OneToOneOutlined,
  PaperClipOutlined,
  PartitionOutlined,
  PayCircleOutlined,
  PercentageOutlined,
  PhoneOutlined,
  PictureOutlined,
  PieChartOutlined,
  PlaySquareOutlined,
  PoundCircleOutlined,
  PoweroffOutlined,
  PrinterOutlined,
  ProjectOutlined,
  PropertySafetyOutlined,
  PushpinOutlined,
  QqOutlined,
  QrcodeOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  RadarChartOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  RadiusSettingOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  ReadOutlined,
  ReconciliationOutlined,
  RedEnvelopeOutlined,
  RedditOutlined,
  RedoOutlined,
  ReloadOutlined,
  RestOutlined,
  RetweetOutlined,
  RightCircleOutlined,
  RightOutlined,
  RightSquareOutlined,
  RiseOutlined,
  RobotOutlined,
  RocketOutlined,
  RollbackOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  ScanOutlined,
  ScissorOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  SelectOutlined,
  SendOutlined,
  ShakeOutlined,
  ShareAltOutlined,
  ShopTwoTone,
  ShoppingOutlined,
  ShrinkOutlined,
  SisternodeOutlined,
  SkinOutlined,
  SlackOutlined,
  SlackSquareOutlined,
  SlidersOutlined,
  SmallDashOutlined,
  SmileOutlined,
  SnippetsOutlined,
  SolutionOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SoundOutlined,
  SplitCellsOutlined,
  StarOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  StockOutlined,
  StopOutlined,
  StrikethroughOutlined,
  SubnodeOutlined,
  SwapLeftOutlined,
  SwapOutlined,
  SwapRightOutlined,
  SwitcherOutlined,
  SyncOutlined,
  TableOutlined,
  TabletOutlined,
  TagTwoTone,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
  ToolOutlined,
  TrademarkCircleOutlined,
  TrademarkOutlined,
  TransactionOutlined,
  TranslationOutlined,
  TrophyOutlined,
  TwitterOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UngroupOutlined,
  UnlockOutlined,
  UploadOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  VerifiedOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
  WalletOutlined,
  WhatsAppOutlined,
  WifiOutlined,
  WomanOutlined,
  YoutubeOutlined,
  YuqueOutlined,
  ZhihuOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';

// Menus base agrupados por papel (role)
const menuByRole = {
  admin: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      key: 'usuarios',
      icon: <TeamOutlined />,
      label: 'Usuários',
      path: '/admin/usuarios'
    },
    {
      key: 'configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
      children: [
        {
          key: 'config-geral',
          label: 'Geral',
          path: '/admin/configuracoes/geral'
        },
        {
          key: 'permissoes',
          label: 'Permissões',
          path: '/admin/configuracoes/permissoes'
        }
      ]
    }
  ],
  medico: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/medico/dashboard'
    },
    {
      key: 'consultas',
      icon: <ScheduleOutlined />,
      label: 'Minhas Consultas',
      path: '/medico/consultas'
    },
    {
      key: 'pacientes',
      icon: <TeamOutlined />,
      label: 'Pacientes',
      path: '/medico/pacientes'
    },
    {
      key: 'prontuarios',
      icon: <FileTextOutlined />,
      label: 'Prontuários',
      path: '/medico/prontuarios'
    }
  ],
  recepcionista: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/recepcionista/dashboard'
    },
    {
      key: 'agenda',
      icon: <CalendarOutlined />,
      label: 'Agenda',
      path: '/recepcionista/agenda'
    },
    {
      key: 'pacientes',
      icon: <TeamOutlined />,
      label: 'Pacientes',
      path: '/recepcionista/pacientes'
    },
    {
      key: 'financeiro',
      icon: <DollarOutlined />,
      label: 'Financeiro',
      children: [
        {
          key: 'pagamentos',
          label: 'Pagamentos',
          path: '/recepcionista/financeiro/pagamentos'
        },
        {
          key: 'faturas',
          label: 'Faturas',
          path: '/recepcionista/financeiro/faturas'
        }
      ]
    }
  ],
  enfermagem: [
    {
      key: 'triagem',
      icon: <MedicineBoxOutlined />,
      label: 'Triagem',
      path: '/enfermagem/triagem'
    },
    {
      key: 'pacientes',
      icon: <TeamOutlined />,
      label: 'Pacientes',
      path: '/enfermagem/pacientes'
    },
    {
      key: 'medicamentos',
      icon: <MedicineBoxOutlined />,
      label: 'Medicamentos',
      path: '/enfermagem/medicamentos'
    }
  ]
};

// Função para obter o menu baseado no papel do usuário
const getMenuByRole = (role) => {
  return menuByRole[role] || [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/dashboard'
    }
  ];
};

// Adiciona itens comuns a todos os menus (como perfil e sair)
const buildMenu = (role) => {
  const menu = getMenuByRole(role);
  
  // Adiciona itens comuns no final do menu
  menu.push(
    {
      type: 'divider'
    },
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      path: '/perfil'
    },
    {
      key: 'sair',
      icon: <LogoutOutlined />,
      label: 'Sair',
      path: '/logout',
      danger: true
    }
  );
  
  return menu;
};

export { getMenuByRole, buildMenu };
