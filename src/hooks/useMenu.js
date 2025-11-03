import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  DollarOutlined,
  BankOutlined,
  FileDoneOutlined,
  InboxOutlined,
  ContainerOutlined,
  TagsOutlined,
  BarcodeOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  FileSyncOutlined,
  FileProtectOutlined,
  AuditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileAddOutlined,
  FileExcelTwoTone,
  FilePdfTwoTone,
  FileWordTwoTone,
  FileImageTwoTone,
  FileZipTwoTone,
  FileUnknownTwoTone,
  FileAddTwoTone,
  FileMarkdownOutlined,
  FileMarkdownTwoTone,
  FilePptOutlined,
  FilePptTwoTone,
  FileTextOutlined as FileTextOut,
  FileTextTwoTone,
  FileTwoTone,
  FileUnknownOutlined as FileUnknownOut,
  FileUnknownTwoTone as FileUnknownTwo,
  FileZipOutlined as FileZipOut,
  FileZipTwoTone as FileZipTwo,
  FilterOutlined,
  FilterTwoTone,
  FireOutlined,
  FireTwoTone,
  FlagOutlined,
  FlagTwoTone,
  FolderAddOutlined,
  FolderAddTwoTone,
  FolderOpenOutlined,
  FolderOpenTwoTone,
  FolderOutlined,
  FolderTwoTone,
  FrownOutlined,
  FrownTwoTone,
  FunnelPlotOutlined,
  FunnelPlotTwoTone,
  GiftOutlined,
  GiftTwoTone,
  GoldOutlined,
  GoldTwoTone,
  HddOutlined,
  HddTwoTone,
  HeartOutlined,
  HeartTwoTone,
  HistoryOutlined,
  HomeOutlined,
  HomeTwoTone,
  HourglassOutlined,
  HourglassTwoTone,
  IdcardOutlined,
  IdcardTwoTone,
  ImportOutlined,
  InboxOutlined as InboxOut,
  InboxTwoTone,
  InsertRowAboveOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  InsuranceOutlined,
  InsuranceTwoTone,
  InteractionOutlined,
  InteractionTwoTone,
  KeyOutlined,
  KeyTwoTone,
  LayoutOutlined,
  LayoutTwoTone,
  LikeOutlined,
  LikeTwoTone,
  LinkOutlined,
  LinkedinOutlined,
  LinkedinTwoTone,
  LinkTwoTone,
  Loading3QuartersOutlined,
  LoadingOutlined,
  LockOutlined,
  LockTwoTone,
  LoginOutlined,
  LogoutOutlined as LogoutOut,
  MailOutlined,
  MailTwoTone,
  ManOutlined,
  MedicineBoxOutlined as MedicineBoxOut,
  MedicineBoxTwoTone,
  MediumOutlined,
  MediumWorkmarkOutlined,
  MehOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MobileOutlined,
  MobileTwoTone,
  MoneyCollectOutlined,
  MoneyCollectTwoTone,
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
  PayCircleTwoTone,
  PercentageOutlined,
  PhoneOutlined,
  PhoneTwoTone,
  PictureOutlined,
  PieChartOutlined,
  PlaySquareOutlined,
  PoundCircleOutlined,
  PoundCircleTwoTone,
  PoweroffOutlined,
  PrinterOutlined,
  ProfileOutlined as ProfileOut,
  ProjectOutlined,
  PropertySafetyOutlined,
  PushpinOutlined,
  PushpinTwoTone,
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
  ReconciliationTwoTone,
  RedEnvelopeOutlined,
  RedEnvelopeTwoTone,
  RedditOutlined,
  RedoOutlined,
  ReloadOutlined,
  RestOutlined,
  RetweetOutlined,
  RightCircleOutlined,
  RightCircleTwoTone,
  RightOutlined,
  RightSquareOutlined,
  RightSquareTwoTone,
  RiseOutlined,
  RobotOutlined,
  RocketOutlined,
  RollbackOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SafetyCertificateOutlined,
  SafetyCertificateTwoTone,
  SaveOutlined,
  SaveTwoTone,
  ScanOutlined,
  ScheduleOutlined as ScheduleOut,
  ScheduleTwoTone,
  ScissorOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  SecurityScanTwoTone,
  SelectOutlined,
  SendOutlined,
  SettingOutlined as SettingOut,
  SettingTwoTone,
  ShakeOutlined,
  ShareAltOutlined,
  ShopOutlined,
  ShopTwoTone,
  ShoppingCartOutlined as ShoppingCartOut,
  ShoppingCartTwoTone,
  ShoppingOutlined,
  ShoppingTwoTone,
  ShrinkOutlined,
  SisternodeOutlined,
  SkinOutlined,
  SkinTwoTone,
  SlackOutlined,
  SlackSquareOutlined,
  SlackSquareTwoTone,
  SlidersOutlined,
  SlidersTwoTone,
  SmallDashOutlined,
  SmileOutlined,
  SmileTwoTone,
  SnippetsOutlined,
  SnippetsTwoTone,
  SolutionOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SoundOutlined,
  SoundTwoTone,
  SplitCellsOutlined,
  StarOutlined,
  StarTwoTone,
  StepBackwardOutlined,
  StepForwardOutlined,
  StockOutlined,
  StopOutlined,
  StopTwoTone,
  StrikethroughOutlined,
  SubnodeOutlined,
  SwapLeftOutlined,
  SwapOutlined,
  SwapRightOutlined,
  SwitcherOutlined,
  SyncOutlined,
  TableOutlined,
  TableTwoTone,
  TabletOutlined,
  TabletTwoTone,
  TagOutlined,
  TagTwoTone,
  TagsOutlined as TagsOut,
  TagsTwoTone,
  TeamOutlined as TeamOut,
  ThunderboltOutlined,
  ThunderboltTwoTone,
  ToTopOutlined,
  ToolOutlined,
  ToolTwoTone,
  TrademarkCircleOutlined,
  TrademarkCircleTwoTone,
  TrademarkOutlined,
  TransactionOutlined,
  TranslationOutlined,
  TrophyOutlined,
  TrophyTwoTone,
  TwitterOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UngroupOutlined,
  UnlockOutlined,
  UnlockTwoTone,
  UploadOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined as UserOut,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  UserTwoTone,
  VerifiedOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
  VideoCameraTwoTone,
  WalletOutlined,
  WalletTwoTone,
  WhatsAppOutlined,
  WifiOutlined,
  WomanOutlined,
  YoutubeOutlined,
  YuqueOutlined,
  ZhihuOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';

const useMenu = (customMenu = []) => {
  const location = useLocation();
  
  const menuItems = useMemo(() => {
    // Se um menu personalizado for fornecido, use-o
    if (customMenu && customMenu.length > 0) {
      return customMenu;
    }
    
    // Menu padrão que será usado quando nenhum menu for especificado
    return [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        path: '/dashboard'
      },
      {
        key: 'pacientes',
        icon: <TeamOut />,
        label: 'Pacientes',
        path: '/pacientes'
      },
      {
        key: 'consultas',
        icon: <ScheduleOut />,
        label: 'Consultas',
        path: '/consultas'
      },
      {
        key: 'medicos',
        icon: <MedicineBoxOut />,
        label: 'Médicos',
        path: '/medicos'
      },
      {
        key: 'financeiro',
        icon: <DollarOutlined />,
        label: 'Financeiro',
        children: [
          {
            key: 'faturas',
            label: 'Faturas',
            path: '/financeiro/faturas'
          },
          {
            key: 'pagamentos',
            label: 'Pagamentos',
            path: '/financeiro/pagamentos'
          },
          {
            key: 'relatorios-financeiros',
            label: 'Relatórios',
            path: '/financeiro/relatorios'
          }
        ]
      },
      {
        key: 'estoque',
        icon: <InboxOut />,
        label: 'Estoque',
        children: [
          {
            key: 'produtos',
            label: 'Produtos',
            path: '/estoque/produtos'
          },
          {
            key: 'fornecedores',
            label: 'Fornecedores',
            path: '/estoque/fornecedores'
          },
          {
            key: 'entradas',
            label: 'Entradas',
            path: '/estoque/entradas'
          },
          {
            key: 'saidas',
            label: 'Saídas',
            path: '/estoque/saidas'
          },
          {
            key: 'ajustes',
            label: 'Ajustes de Estoque',
            path: '/estoque/ajustes'
          },
          {
            key: 'relatorios-estoque',
            label: 'Relatórios',
            path: '/estoque/relatorios'
          }
        ]
      },
      {
        key: 'configuracoes',
        icon: <SettingOut />,
        label: 'Configurações',
        children: [
          {
            key: 'usuarios',
            label: 'Usuários',
            path: '/configuracoes/usuarios'
          },
          {
            key: 'perfis',
            label: 'Perfis de Acesso',
            path: '/configuracoes/perfis'
          },
          {
            key: 'configuracoes-sistema',
            label: 'Sistema',
            path: '/configuracoes/sistema'
          }
        ]
      },
      {
        key: 'perfil',
        icon: <UserOut />,
        label: 'Meu Perfil',
        path: '/perfil'
      },
      {
        key: 'sair',
        icon: <LogoutOut />,
        label: 'Sair',
        danger: true
      }
    ];
  }, [customMenu]);

  // Encontra a chave do item ativo com base no caminho atual
  const findActiveKeys = (items = menuItems, parentKey = '') => {
    for (const item of items) {
      const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
      
      if (item.path && location.pathname.startsWith(item.path)) {
        return [fullKey];
      }
      
      if (item.children) {
        const activeChild = findActiveKeys(item.children, fullKey);
        if (activeChild.length > 0) {
          return [fullKey, ...activeChild];
        }
      }
    }
    return [];
  };

  const selectedKeys = findActiveKeys();
  const openKeys = selectedKeys.length > 0 ? [selectedKeys[0]] : [];

  return {
    menuItems,
    selectedKeys,
    openKeys
  };
};

export default useMenu;
