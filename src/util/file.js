import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AirlineSeatFlatAngledIcon from '@mui/icons-material/AirlineSeatFlatAngled';
import LogoutIcon from '@mui/icons-material/Logout';
import { cyan } from '@mui/material/colors';

const iconFundo = cyan;
const sizeFundo = 900;

export const NAVIGATION = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    { kind: 'divider' },
    {
        segment: 'triagem',
        title: 'Triagem',
        icon: <VaccinesIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    {
        segment: 'so',
        title: 'SO',
        icon: <MeetingRoomIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    {
        segment: 'bloco-operatorio',
        title: 'Bloco Operatório',
        icon: <ShoppingCartIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    {
        segment: 'internamento',
        title: 'Internamento',
        icon: (
            <AirlineSeatFlatAngledIcon
                style={{ color: iconFundo[sizeFundo] }}
            />
        ),
    },
    {
        segment: 'consultas-externas',
        title: 'Consultas Externas',
        icon: <ShoppingCartIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    {
        segment: 'permanencia-cirurgia',
        title: 'Permanência de Cirurgia',
        icon: <ShoppingCartIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    { kind: 'divider' },
    {
        segment: 'perfil',
        title: 'Perfil',
        icon: <ManageAccountsIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
    {
        segment: 'logout',
        title: 'Logout',
        icon: <LogoutIcon style={{ color: iconFundo[sizeFundo] }} />,
    },
];

export const TM = [
    {
        id: 1,
        value: 'Agressão',
    },
    {
        id: 2,
        value: 'Alergia',
    },
    {
        id: 3,
        value: 'Asma',
    },
    {
        id: 5,
        value: 'Bebé que chora (P)',
    },
    {
        id: 6,
        value: 'Cefaleia',
    },
    {
        id: 7,
        value: 'Comportamento estranho',
    },
    {
        id: 8,
        value: 'Convulsões',
    },
    {
        id: 9,
        value: 'Corpo estranho',
    },
    {
        id: 10,
        value: 'Criança com dificuldade de locomoção (P)',
    },
    {
        id: 11,
        value: 'Criança Irritável (P)',
    },
    {
        id: 12,
        value: 'Diabetes',
    },
    {
        id: 13,
        value: 'Diarreia e /ou vómitos',
    },
];

export const VERMELHO = [
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 1,
    },
    {
        value: 'Respiração ineficaz',
        queixa_id: 1,
    },
    {
        value: 'Hemorragia exsanguinante',
        queixa_id: 1,
    },
    {
        value: 'Choque',
        queixa_id: 1,
    },

    //2
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 2,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 2,
    },
    {
        value: 'Estridor',
        queixa_id: 2,
    },
    {
        value: 'Choque',
        queixa_id: 2,
    },
    {
        value: 'Criança não reactiva',
        queixa_id: 2,
    },

    //3

    {
        value: 'Compromisso de via aérea?',
        queixa_id: 3,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 3,
    },

    {
        value: 'Choque',
        queixa_id: 3,
    },
    {
        value: 'Criança não reactiva',
        queixa_id: 3,
    },
    //4

    {
        value: 'Compromisso de via aérea?',
        queixa_id: 4,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 4,
    },

    {
        value: 'Hemorragia exsanguinante',
        queixa_id: 4,
    },
    {
        value: 'Choque',
        queixa_id: 4,
    },
    //5

    {
        value: 'Compromisso de via aérea?',
        queixa_id: 5,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 5,
    },

    {
        value: 'Choque',
        queixa_id: 5,
    },
    {
        value: 'Criança não reactiva',
        queixa_id: 5,
    },

    //6
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 6,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 6,
    },

    {
        value: 'Choque',
        queixa_id: 6,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 6,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 6,
    },
    //7
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 7,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 7,
    },

    {
        value: 'Choque',
        queixa_id: 7,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 7,
    },
    //8
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 8,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 8,
    },
    {
        value: 'Choque?',
        queixa_id: 8,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 8,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 8,
    },
    {
        value: 'Hiploglemia?',
        queixa_id: 8,
    },
    //6
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 9,
    },
    {
        value: 'Estridor?',
        queixa_id: 9,
    },

    {
        value: 'Respiração ineficaz',
        queixa_id: 9,
    },
    {
        value: 'Hemorraiga exsanguinante?',
        queixa_id: 9,
    },
    {
        value: 'Choque?',
        queixa_id: 9,
    },

    //10
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 10,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 10,
    },
    {
        value: 'Choque?',
        queixa_id: 10,
    },

    //11
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 11,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 11,
    },

    {
        value: 'Choque?',
        queixa_id: 11,
    },
    {
        value: 'Hiploglemia?',
        queixa_id: 11,
    },
    {
        value: 'Criança actual?',
        queixa_id: 11,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 11,
    },

    //12
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 12,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 12,
    },

    {
        value: 'Choque?',
        queixa_id: 12,
    },
    {
        value: 'Hiploglemia?',
        queixa_id: 12,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 12,
    },
    //13
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 13,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 13,
    },
    {
        value: 'Choque?',
        queixa_id: 13,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 13,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 13,
    },

    //14
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 14,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 14,
    },
    {
        value: 'Choque?',
        queixa_id: 14,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 14,
    },
    //15
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 15,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 15,
    },
    {
        value: 'Estridor?',
        queixa_id: 15,
    },
    {
        value: 'baba-se?',
        queixa_id: 15,
    },
    {
        value: 'Choque?',
        queixa_id: 15,
    },

    //16
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 16,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 16,
    },
    {
        value: 'Estridor?',
        queixa_id: 16,
    },
    {
        value: 'baba-se?',
        queixa_id: 16,
    },
    {
        value: 'Choque?',
        queixa_id: 16,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 16,
    },

    //17
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 17,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 17,
    },
    {
        value: 'Choque?',
        queixa_id: 17,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 17,
    },

    //18
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 18,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 18,
    },
    {
        value: 'Choque?',
        queixa_id: 18,
    },

    //19
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 19,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 19,
    },
    {
        value: 'Choque?',
        queixa_id: 19,
    },

    //20
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 20,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 20,
    },
    {
        value: 'Choque?',
        queixa_id: 20,
    },

    //21
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 21,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 21,
    },
    {
        value: 'Choque?',
        queixa_id: 21,
    },

    //22
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 22,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 22,
    },
    {
        value: 'Estridor?',
        queixa_id: 22,
    },
    {
        value: 'baba-se?',
        queixa_id: 22,
    },
    {
        value: 'Choque?',
        queixa_id: 22,
    },

    //23
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 23,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 23,
    },
    {
        value: 'Choque?',
        queixa_id: 23,
    },

    //24
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 24,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 24,
    },
    {
        value: 'Choque?',
        queixa_id: 24,
    },

    //25
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 25,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 25,
    },
    {
        value: 'Choque?',
        queixa_id: 25,
    },

    //26
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 26,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 26,
    },
    {
        value: 'Choque?',
        queixa_id: 26,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 26,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 26,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 26,
    },

    //27
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 27,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 27,
    },
    {
        value: 'Estridor?',
        queixa_id: 27,
    },
    {
        value: 'Choque?',
        queixa_id: 27,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 27,
    },

    //28
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 28,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 28,
    },
    {
        value: 'Choque?',
        queixa_id: 28,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 28,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 28,
    },

    //29
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 29,
    },
    {
        value: 'Estridor?',
        queixa_id: 29,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 29,
    },
    {
        value: 'Choque?',
        queixa_id: 29,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 29,
    },
    {
        value: 'lesão ocular quimica ?',
        queixa_id: 29,
    },

    //30
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 30,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 30,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 30,
    },
    {
        value: 'Choque?',
        queixa_id: 30,
    },

    //31
    {
        value: 'Compromisso de via aérea?',
        queixa_id: 31,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 31,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 31,
    },
    {
        value: 'Choque?',
        queixa_id: 31,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 31,
    },

    //32
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 32,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 32,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 32,
    },
    {
        value: 'Choque?',
        queixa_id: 32,
    },
    {
        value: 'apresentação de sagmentos fetais?',
        queixa_id: 32,
    },
    {
        value: 'prolapso do cordão umbilical?',
        queixa_id: 32,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 32,
    },

    //33
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 33,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 33,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 33,
    },
    {
        value: 'Choque?',
        queixa_id: 33,
    },

    //34
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 34,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 34,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 34,
    },
    {
        value: 'Choque?',
        queixa_id: 34,
    },

    //35
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 35,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 35,
    },
    {
        value: 'Choque?',
        queixa_id: 35,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 35,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 35,
    },

    //36
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 36,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 36,
    },
    {
        value: 'Choque?',
        queixa_id: 36,
    },

    //37
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 37,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 37,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 37,
    },
    {
        value: 'Choque?',
        queixa_id: 37,
    },

    //38
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 38,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 38,
    },
    {
        value: 'Estridor?',
        queixa_id: 38,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 38,
    },
    {
        value: 'Choque?',
        queixa_id: 38,
    },

    //39
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 39,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 39,
    },
    {
        value: 'Choque?',
        queixa_id: 39,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 39,
    },

    //40
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 40,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 40,
    },
    {
        value: 'Choque?',
        queixa_id: 40,
    },

    //41
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 41,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 41,
    },
    {
        value: 'Choque?',
        queixa_id: 41,
    },

    //42
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 42,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 42,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 42,
    },
    {
        value: 'Choque?',
        queixa_id: 42,
    },

    //43
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 43,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 43,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 43,
    },
    {
        value: 'Choque?',
        queixa_id: 43,
    },

    //44
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 44,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 44,
    },
    {
        value: 'Choque?',
        queixa_id: 44,
    },
    {
        value: 'lesão ocular quimica?',
        queixa_id: 44,
    },

    //45
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 45,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 45,
    },
    {
        value: 'Choque?',
        queixa_id: 45,
    },

    //46
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 46,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 46,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 46,
    },
    {
        value: 'Choque?',
        queixa_id: 46,
    },

    //47
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 47,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 47,
    },
    {
        value: 'Choque?',
        queixa_id: 47,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 47,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 47,
    },

    {
        value: 'Hiploglemia?',
        queixa_id: 47,
    },

    //48
    {
        value: 'Respiração ineficaz?',
        queixa_id: 48,
    },
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 48,
    },
    {
        value: 'Estridor?',
        queixa_id: 48,
    },
    {
        value: 'Choque?',
        queixa_id: 48,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 48,
    },

    //49
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 49,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 49,
    },
    {
        value: 'Choque?',
        queixa_id: 49,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 49,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 49,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 49,
    },

    //50
    {
        value: 'Compromisso da via aérea?',
        queixa_id: 50,
    },
    {
        value: 'Respiração ineficaz?',
        queixa_id: 50,
    },
    {
        value: 'Hemorragia exsanguinante?',
        queixa_id: 50,
    },
    {
        value: 'Choque?',
        queixa_id: 50,
    },
    {
        value: 'Criança não reactiva?',
        queixa_id: 50,
    },
    {
        value: 'convulsão actual?',
        queixa_id: 50,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 50,
    },
    {
        //52
        value: 'TRTS 10?',
        queixa_id: 52,
    },
];

export const LARANJA = [
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 1,
    },
    {
        value: 'Dispenia aguda?',
        queixa_id: 1,
    },
    {
        value: 'Grande hemorragia incontrolável?',
        queixa_id: 1,
    },
    {
        value: 'Alteração de estado de consciência de novo',
        queixa_id: 1,
    },
    {
        value: 'Défice neurológico agudo?',
        queixa_id: 1,
    },
    {
        value: 'Dor severa?',
        queixa_id: 1,
    },

    //2
    {
        value: 'Edma facial?',
        queixa_id: 2,
    },
    {
        value: 'Edma na lingua?',
        queixa_id: 2,
    },
    {
        value: 'História significativa de Alergia?',
        queixa_id: 2,
    },
    {
        value: 'incapacidade de artucular frases comleta?',
        queixa_id: 2,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 2,
    },
    {
        value: 'Alteração de estado consciência de novo?',
        queixa_id: 2,
    },
    {
        value: 'SaO2?',
        queixa_id: 2,
    },
    {
        value: 'Dor severa?',
        queixa_id: 2,
    },
    {
        value: 'Prurido servera?',
        queixa_id: 2,
    },

    //3
    {
        value: 'incapacidade de artucular frases completas?',
        queixa_id: 3,
    },
    {
        value: 'historico significativa de doença respiratoria?',
        queixa_id: 3,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 3,
    },
    {
        value: 'saO2 muito baixo?',
        queixa_id: 3,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 3,
    },
    {
        value: 'PEFR muito baixo?',
        queixa_id: 3,
    },

    //4
    {
        value: 'dispneia aguda?',
        queixa_id: 4,
    },
    {
        value: 'Grande Hemorragia incontrolável?',
        queixa_id: 4,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 4,
    },
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 4,
    },
    {
        value: 'alto risco de novo Auto-aressão?',
        queixa_id: 4,
    },
    {
        value: 'Dor severa?',
        queixa_id: 4,
    },
    //5
    {
        value: 'sinais de dor severa?',
        queixa_id: 5,
    },
    {
        value: 'só responde á voz e á Dor?',
        queixa_id: 5,
    },
    {
        value: 'prostrado?',
        queixa_id: 5,
    },
    {
        value: 'púrpura?',
        queixa_id: 5,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 5,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 5,
    },
    //6
    {
        value: 'início repentino?',
        queixa_id: 6,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 6,
    },
    {
        value: 'Défice neurológico agudo?',
        queixa_id: 6,
    },
    {
        value: 'perda súbita de visão com início nas 24 horas anteriores?',
        queixa_id: 6,
    },
    {
        value: 'sinais de meningismo?',
        queixa_id: 6,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 6,
    },
    {
        value: 'púrpura?',
        queixa_id: 6,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 6,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 6,
    },
    {
        value: 'Dor severa?',
        queixa_id: 6,
    },
    {
        //7
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 7,
    },
    {
        value: 'Défice neurológico agudo?',
        queixa_id: 7,
    },
    {
        value: 'História de sobredosagem ou envenenamento  ?',
        queixa_id: 7,
    },
    {
        value: 'alto resco de Agressão a terceiros?',
        queixa_id: 7,
    },
    {
        value: 'alto risco de Auto-aressão?',
        queixa_id: 7,
    },
    //8
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 8,
    },
    {
        value: 'Défice neurológico agudo?',
        queixa_id: 8,
    },
    {
        value: 'sinais de meningismo?',
        queixa_id: 8,
    },
    {
        value: 'historia de sobredosagem ou envenenamento?',
        queixa_id: 8,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 8,
    },
    {
        value: 'púrpura?',
        queixa_id: 8,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 8,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 8,
    },

    //9
    {
        value: 'Grande Hemorragia inconsolavel?',
        queixa_id: 9,
    },
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 9,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 9,
    },
    {
        value: 'traumatismo ocular penetrante?',
        queixa_id: 9,
    },
    {
        value: 'dor severa?',
        queixa_id: 9,
    },
    //10
    {
        value: 'sinais de dor severa?',
        queixa_id: 10,
    },
    {
        value: 'Compromisso vascular distal?',
        queixa_id: 10,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 10,
    },
    {
        value: 'púrpura?',
        queixa_id: 10,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 10,
    },
    //11
    {
        value: 'sinais de dor severa?',
        queixa_id: 11,
    },
    {
        value: 'só responde a voz e á dor?',
        queixa_id: 11,
    },
    {
        value: 'sem reacção aos estimulos dos pais  ?',
        queixa_id: 11,
    },
    {
        value: 'sinais de meningismo?',
        queixa_id: 11,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 11,
    },
    {
        value: 'púrpura?',
        queixa_id: 11,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 11,
    },
    {
        value: 'hipotemia ?',
        queixa_id: 11,
    },

    //12
    {
        value: 'sinais de dor severa?',
        queixa_id: 12,
    },
    {
        value: 'só responde a voz e á dor?',
        queixa_id: 12,
    },
    {
        value: 'historia de sobredosagem ou envenenamento ?',
        queixa_id: 12,
    },
    {
        value: 'sinais de meningismo?',
        queixa_id: 12,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 12,
    },
    {
        value: 'púrpura?',
        queixa_id: 12,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 12,
    },

    //13
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 13,
    },
    {
        value: 'Hiploglemia com cetose?',
        queixa_id: 13,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 13,
    },
    {
        value: 'Adulto muito quentre?',
        queixa_id: 13,
    },
    {
        value: 'hipotemia?',
        queixa_id: 13,
    },
    {
        value: 'púrpura?',
        queixa_id: 13,
    },
    {
        value: 'Dor severa?',
        queixa_id: 13,
    },
    //14
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 14,
    },
    {
        value: 'sem reacção aos estimulos dos pais?',
        queixa_id: 14,
    },
    {
        value: 'hematoquésias ou rectorragias?',
        queixa_id: 14,
    },
    {
        value: 'hematemeses?',
        queixa_id: 14,
    },
    {
        value: 'letárgico?',
        queixa_id: 14,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 14,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 14,
    },
    {
        value: 'dor severa',
        queixa_id: 14,
    },

    //15
    {
        value: 'dor precardial ?',
        queixa_id: 15,
    },
    {
        value: 'SaO2 muito baixa?',
        queixa_id: 15,
    },
    {
        value: 'incapacidade de articular frases completas?',
        queixa_id: 15,
    },
    {
        value: 'hemoptise?',
        queixa_id: 15,
    },
    {
        value: 'historia significativa de  doença respiratoria?',
        queixa_id: 15,
    },
    {
        value: 'início agudo pós-traumático?',
        queixa_id: 15,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 15,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 15,
    },
    {
        value: 'exaustão?',
        queixa_id: 15,
    },
    {
        value: 'Dor epigástrica?',
        queixa_id: 15,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 15,
    },
    {
        value: 'PEFR muito baixo?',
        queixa_id: 15,
    },

    //16
    {
        value: 'SaO2 muito baixa?',
        queixa_id: 16,
    },
    {
        value: 'trabalho respiratorio aumentado?',
        queixa_id: 16,
    },
    {
        value: 'incapacidade de articular frases completas?',
        queixa_id: 16,
    },
    {
        value: 'hemoptise?',
        queixa_id: 16,
    },
    {
        value: 'historia significativa de  doença respiratoria?',
        queixa_id: 16,
    },
    {
        value: 'início agudo pós-traumático?',
        queixa_id: 16,
    },
    {
        value: 'só responde á voz ou á dor?',
        queixa_id: 16,
    },
    {
        value: 'exaustão?',
        queixa_id: 16,
    },
    {
        value: 'PEFR muito baixo?',
        queixa_id: 16,
    },

    //17
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 17,
    },
    {
        value: 'alto resco de agressão a terceiros?',
        queixa_id: 17,
    },
    {
        value: 'alto risco de autro-Agressão?',
        queixa_id: 17,
    },

    //18
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 18,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 18,
    },
    {
        value: 'púrpura?',
        queixa_id: 18,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 18,
    },
    {
        value: 'dor severa?',
        queixa_id: 18,
    },

    //19
    {
        value: 'dor irradiando para a região dorsal?',
        queixa_id: 19,
    },
    {
        value: 'hematemeses ?',
        queixa_id: 19,
    },
    {
        value: 'hematemeses ou rectorragias?',
        queixa_id: 19,
    },
    {
        value: 'Hemorragia vainal em gestão > 20 semanas?',
        queixa_id: 19,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 19,
    },
    {
        value: ' dor epigástrica?',
        queixa_id: 19,
    },
    {
        value: 'Dor severa?',
        queixa_id: 19,
    },

    //20
    {
        value: 'sinais dor severa?',
        queixa_id: 20,
    },
    {
        value: 'hematemeses?',
        queixa_id: 20,
    },
    {
        value: 'hematoquésias?',
        queixa_id: 20,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 20,
    },
    {
        value: 'púrpura?',
        queixa_id: 20,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 20,
    },

    //21
    {
        value: 'sinais de menigismo?',
        queixa_id: 21,
    },
    {
        value: 'déffece neurológico aguda?',
        queixa_id: 21,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 21,
    },
    {
        value: 'púrpura?',
        queixa_id: 21,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 21,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 21,
    },
    {
        value: 'dor severa ?',
        queixa_id: 21,
    },

    //22
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 22,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 22,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 22,
    },
    {
        value: 'dor severa?',
        queixa_id: 22,
    },

    //23
    {
        value: 'Défice neurológico agudo?',
        queixa_id: 23,
    },
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 23,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 23,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 23,
    },
    {
        value: 'dor abdominal?',
        queixa_id: 23,
    },
    {
        value: 'dor severa?',
        queixa_id: 23,
    },

    //24
    {
        value: 'idade ≥ 25 anos?',
        queixa_id: 24,
    },
    {
        value: 'Ganrena escrotal?',
        queixa_id: 24,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 24,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 24,
    },
    {
        value: 'dor abdominal?',
        queixa_id: 24,
    },

    //25
    {
        value: 'dor precardial?',
        queixa_id: 25,
    },
    {
        value: 'Dispenia aguda?',
        queixa_id: 25,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 25,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 25,
    },
    {
        value: 'dor severa?',
        queixa_id: 25,
    },

    //26
    {
        value: 'Alteração do estado de consciência não completamente atribuivel ao álco?',
        queixa_id: 26,
    },
    {
        value: 'défece neurológico agudo?',
        queixa_id: 26,
    },
    {
        value: 'historia inadequada?',
        queixa_id: 26,
    },
    {
        value: 'hipotemia?',
        queixa_id: 26,
    },

    //27

    {
        value: 'Edma da face?',
        queixa_id: 27,
    },
    {
        value: 'Edma da lingua?',
        queixa_id: 27,
    },
    {
        value: 'dispneia aguda?',
        queixa_id: 27,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 27,
    },
    {
        value: 'historia significativa de Alergia?',
        queixa_id: 27,
    },
    {
        value: 'erupção cutanea desconhecida?',
        queixa_id: 27,
    },
    {
        value: 'púrpura?',
        queixa_id: 27,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 27,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 27,
    },
    {
        value: 'dor severa?',
        queixa_id: 27,
    },
    {
        value: 'Prurido severo?',
        queixa_id: 27,
    },

    //28

    {
        value: 'dor procardial?',
        queixa_id: 28,
    },
    {
        value: 'historia significativa de Alergia?',
        queixa_id: 28,
    },
    {
        value: 'dispneia aguda?',
        queixa_id: 28,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 28,
    },
    {
        value: 'défece neurológico auda?',
        queixa_id: 28,
    },
    {
        value: 'púrpura?',
        queixa_id: 28,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 28,
    },
    {
        value: 'Hipoglicemia?',
        queixa_id: 28,
    },
    {
        value: 'dor severa?',
        queixa_id: 28,
    },

    //29

    {
        value: 'alta mrtalidade?',
        queixa_id: 29,
    },
    {
        value: 'edema da face?',
        queixa_id: 29,
    },
    {
        value: 'edema da lingua?',
        queixa_id: 29,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 29,
    },
    {
        value: 'risco de contaminação?',
        queixa_id: 29,
    },
    {
        value: 'SaO2 muito baixa?',
        queixa_id: 29,
    },
    {
        value: 'dor severa?',
        queixa_id: 29,
    },

    //30

    {
        value: 'Grande Hemorragia inconsolavel?',
        queixa_id: 30,
    },
    {
        value: 'Compromisso vascular distal?',
        queixa_id: 30,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 30,
    },
    {
        value: 'dor severa?',
        queixa_id: 30,
    },

    //31

    {
        value: 'despeneia aguda?',
        queixa_id: 31,
    },
    {
        value: 'Grande Hemorragia incontrolavel?',
        queixa_id: 31,
    },
    {
        value: 'Alteração do estado de consciência?',
        queixa_id: 31,
    },
    {
        value: 'défece neurológico agudo ?',
        queixa_id: 31,
    },
    {
        value: 'mecanismo de lesão?',
        queixa_id: 31,
    },
    {
        value: 'dor severa?',
        queixa_id: 31,
    },

    //32

    {
        value: 'Em trabalho de parto?',
        queixa_id: 32,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 32,
    },
    {
        value: 'historia de convulsão?',
        queixa_id: 32,
    },
    {
        value: 'Hemorragia vainal intenssa?',
        queixa_id: 32,
    },
    {
        value: 'Hemorragia vainal em gestão > 20 semanas  ?',
        queixa_id: 32,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 32,
    },
    {
        value: 'dor severa?',
        queixa_id: 32,
    },

    //33

    {
        value: 'hematemeses?',
        queixa_id: 33,
    },
    {
        value: 'hematoquésias ou rectorragias?',
        queixa_id: 33,
    },
    {
        value: 'historia significativa de Hemorragia grastotestinal?',
        queixa_id: 33,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 33,
    },
    {
        value: 'dor severa?',
        queixa_id: 33,
    },

    //34

    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 34,
    },
    {
        value: 'Hemorragia vaginal > 20 semanas?',
        queixa_id: 34,
    },
    {
        value: 'Hemorragia vaginal intensa?',
        queixa_id: 34,
    },
    {
        value: 'dor severa?',
        queixa_id: 34,
    },

    //35
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 35,
    },
    {
        value: 'hemoptise?',
        queixa_id: 35,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 35,
    },
    {
        value: 'sinais de meningismo?',
        queixa_id: 35,
    },
    {
        value: 'déffice de neurológico aguda?',
        queixa_id: 35,
    },
    {
        value: 'historia de risco especial de infecção?',
        queixa_id: 35,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 35,
    },
    {
        value: 'púrpura?',
        queixa_id: 35,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 35,
    },
    {
        value: 'hipotemia?',
        queixa_id: 35,
    },
    {
        value: 'Dor severa?',
        queixa_id: 35,
    },

    //36
    {
        value: 'Compromisso vascular distal?',
        queixa_id: 36,
    },
    {
        value: 'enfisema sebcutaneo?',
        queixa_id: 36,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 36,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 36,
    },
    {
        value: 'dor severa?',
        queixa_id: 36,
    },

    //37
    {
        value: 'Dispenia aguda?',
        queixa_id: 37,
    },
    {
        value: 'grande hemorragia incontrolavel ?',
        queixa_id: 37,
    },
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 37,
    },
    {
        value: 'evisceração de órgãos?',
        queixa_id: 37,
    },
    {
        value: 'dor severa?',
        queixa_id: 37,
    },

    //38
    {
        value: 'edema da face?',
        queixa_id: 38,
    },
    {
        value: 'edma da lingua?',
        queixa_id: 38,
    },
    {
        value: 'incapacidade para articular frases complentas?',
        queixa_id: 38,
    },
    {
        value: 'grande Hemorragia incontrolavel?',
        queixa_id: 38,
    },
    {
        value: 'historia de alergia ?',
        queixa_id: 38,
    },
    {
        value: 'Alteração do estado de consciência de novo ?',
        queixa_id: 38,
    },
    {
        value: 'saO2 muito baixo?',
        queixa_id: 38,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 38,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 38,
    },
    {
        value: 'Dor severa?',
        queixa_id: 38,
    },
    {
        value: 'prurido severo?',
        queixa_id: 38,
    },

    //39

    {
        value: 'sinas de dor severa?',
        queixa_id: 39,
    },
    {
        value: 'só responde a voz ou á dor ?',
        queixa_id: 39,
    },
    {
        value: 'sem reacção aos estimolos pais?',
        queixa_id: 39,
    },
    {
        value: 'historia de sobredosagem ou envenenamento?',
        queixa_id: 39,
    },
    {
        value: 'europção cutanea desconhecida?',
        queixa_id: 39,
    },
    {
        value: 'púrpura?',
        queixa_id: 39,
    },
    {
        value: 'prostado?',
        queixa_id: 39,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 39,
    },

    //40

    {
        value: 'dor precardial?',
        queixa_id: 40,
    },
    {
        value: 'dispneia aguda?',
        queixa_id: 40,
    },
    {
        value: 'historia de sobredosagem ou envenenamento?',
        queixa_id: 40,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 40,
    },
    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 40,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 40,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 40,
    },

    //41

    {
        value: 'Compromisso da via aérea?',
        queixa_id: 41,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 41,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 41,
    },
    {
        value: 'dor severa?',
        queixa_id: 41,
    },

    //42

    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 42,
    },
    {
        value: 'grande Hemorragia inconsolavel?',
        queixa_id: 42,
    },
    {
        value: 'adulto muito quente?',
        queixa_id: 42,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 42,
    },
    {
        value: 'dor severa ?',
        queixa_id: 42,
    },

    //43

    {
        value: 'Dispenia aguda?',
        queixa_id: 43,
    },
    {
        value: 'pele critica?',
        queixa_id: 43,
    },
    {
        value: 'Compromisso vascular distal?',
        queixa_id: 43,
    },
    {
        value: 'grande Hemorragia inconsolavel?',
        queixa_id: 43,
    },
    {
        value: 'dor severa ?',
        queixa_id: 43,
    },

    //44

    {
        value: 'traumatismo ocular penetrante?',
        queixa_id: 44,
    },
    {
        value: 'perda súbita de visão com inicio nas 24 horas anteriores ?',
        queixa_id: 44,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 44,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 44,
    },
    {
        value: 'dor severa ?',
        queixa_id: 44,
    },

    //45

    {
        value: 'Alteração do estado de consciência de novo?',
        queixa_id: 45,
    },
    {
        value: 'grande Hemorragia incontrolavel ?',
        queixa_id: 45,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 45,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 45,
    },
    {
        value: 'dor severa ?',
        queixa_id: 45,
    },

    //46

    {
        value: 'priapismo?',
        queixa_id: 46,
    },
    {
        value: 'Adulto muito quente?',
        queixa_id: 46,
    },
    {
        value: 'Criança muito quente?',
        queixa_id: 46,
    },
    {
        value: 'dor severa?',
        queixa_id: 46,
    },

    //47

    {
        value: 'Mecanismo de lesão?',
        queixa_id: 47,
    },
    {
        value: 'pulso anormal?',
        queixa_id: 47,
    },
    {
        value: 'grande Hemorragia incontrolavel?',
        queixa_id: 47,
    },
    {
        value: 'défece neurológico agudo?',
        queixa_id: 47,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 47,
    },
    {
        value: 'hiportemia?',
        queixa_id: 47,
    },
    {
        value: 'dor severa?',
        queixa_id: 47,
    },

    //48

    {
        value: 'edema da face?',
        queixa_id: 48,
    },
    {
        value: 'lesão por inalação?',
        queixa_id: 48,
    },
    {
        value: 'Dispenia auda?',
        queixa_id: 48,
    },
    {
        value: 'défece neurológico agudo?',
        queixa_id: 48,
    },
    {
        value: 'Mecanismo de lesão?',
        queixa_id: 48,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 48,
    },
    {
        value: 'saO2?',
        queixa_id: 48,
    },
    {
        value: 'dor severa?',
        queixa_id: 48,
    },

    //49

    {
        value: 'pulso anormal?',
        queixa_id: 49,
    },
    {
        value: 'alta mortalidade?',
        queixa_id: 49,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 49,
    },
    {
        value: 'alto resco de nova auto-Agressão?',
        queixa_id: 49,
    },
    {
        value: 'saO2 muito baixa?',
        queixa_id: 49,
    },

    //50

    {
        value: 'pulso anormal?',
        queixa_id: 50,
    },
    {
        value: 'alta mortalidade?',
        queixa_id: 50,
    },
    {
        value: 'Alteração de estado de consciência de novo?',
        queixa_id: 50,
    },
    {
        value: 'alto resco de nova auto-Agressão?',
        queixa_id: 50,
    },
    {
        value: 'saO2 muito baixa?',
        queixa_id: 50,
    },
];

export const AMARELO = [
    {
        value: 'Pequena hemorragia incontrolável?',
        queixa_id: 1,
    },
    {
        value: 'História de perda de consciência?',
        queixa_id: 1,
    },
    {
        value: 'Novos sintomas e/ou sinais nerológicos?',
        queixa_id: 1,
    },
    {
        value: 'Alteração da coagulação?',
        queixa_id: 1,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 1,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 1,
    },

    //2
    {
        value: 'SaO2 baixa',
        queixa_id: 2,
    },
    {
        value: 'exantema eritematoso ou bolhoso',
        queixa_id: 2,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 2,
    },
    {
        value: 'prurido moderado?',
        queixa_id: 2,
    },

    //3
    {
        value: 'saO2 baixo?',
        queixa_id: 3,
    },
    {
        value: 'Asma sm melhoria com o seu tratamento habitual ?',
        queixa_id: 3,
    },
    {
        value: 'PEFR baixo?',
        queixa_id: 3,
    },
    //4
    {
        value: 'Pequena Hemorragia incontrolável?',
        queixa_id: 4,
    },
    {
        value: 'risco moderado de autro-Agressão?',
        queixa_id: 4,
    },
    {
        value: 'Históris psiquiátrica sinificativa?',
        queixa_id: 4,
    },
    {
        value: 'Alteração da coagulação?',
        queixa_id: 4,
    },
    {
        value: 'angústia marcada?',
        queixa_id: 4,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 4,
    },

    //5
    {
        value: 'sinais de dor moderada?',
        queixa_id: 5,
    },
    {
        value: 'História de perda de consciência?',
        queixa_id: 5,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 5,
    },
    {
        value: 'inconsolavel pelos pais?',
        queixa_id: 5,
    },
    {
        value: 'choro prolongado ou ininterrupto?',
        queixa_id: 5,
    },
    {
        value: 'incapaz de se alimentar?',
        queixa_id: 5,
    },
    {
        value: 'Criança quente?',
        queixa_id: 5,
    },
    //6
    {
        value: 'historia de T.C.E?',
        queixa_id: 6,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 6,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 6,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 6,
    },
    {
        value: 'recente redução de acuidade visual?',
        queixa_id: 6,
    },
    {
        value: 'vómitos persistentes?',
        queixa_id: 6,
    },
    {
        value: 'novos sintomas e/ou sinais neurológico?',
        queixa_id: 6,
    },
    {
        value: 'Dor á palpação da região temporal?',
        queixa_id: 6,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 6,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 6,
    },
    //7
    {
        value: 'historia de T.C.E.?',
        queixa_id: 7,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 7,
    },
    {
        value: 'Novos sintomas e/ou sinais neurológico  ?',
        queixa_id: 7,
    },
    {
        value: 'hestorico psiquiátrica significativa?',
        queixa_id: 7,
    },
    {
        value: 'risco moderado Agressão a terceiros?',
        queixa_id: 7,
    },
    {
        value: 'risco moderado de outra-agressão?',
        queixa_id: 7,
    },

    //8
    {
        value: 'historia de T.C.E.?',
        queixa_id: 8,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 8,
    },
    {
        value: 'Novos sintomas e/ou sinais neurológico?',
        queixa_id: 8,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 8,
    },
    {
        value: 'Criança quente?',
        queixa_id: 8,
    },
    {
        value: 'historia de convulsão?',
        queixa_id: 8,
    },
    //9
    {
        value: 'historia inapropriada?',
        queixa_id: 9,
    },
    {
        value: 'pequena hemorragia inconsolavel?',
        queixa_id: 9,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 9,
    },

    //10
    {
        value: 'sinais de dor moderada?',
        queixa_id: 10,
    },
    {
        value: 'dor e mobilização das articulações?',
        queixa_id: 10,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 10,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 10,
    },
    {
        value: 'articulações quente?',
        queixa_id: 10,
    },
    {
        value: 'Criança quente?',
        queixa_id: 10,
    },
    //11
    {
        value: 'sinais de dor moderada?',
        queixa_id: 11,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 11,
    },
    {
        value: 'sinais de desidratração?',
        queixa_id: 11,
    },
    {
        value: 'rentençao urinaria/ oligoanúria?',
        queixa_id: 11,
    },
    {
        value: 'não se alienta?',
        queixa_id: 11,
    },
    {
        value: 'Criança quente?',
        queixa_id: 11,
    },
    //12
    {
        value: 'sinais de dor moderada?',
        queixa_id: 12,
    },
    {
        value: 'inecapacidade de difecar?',
        queixa_id: 12,
    },
    {
        value: 'não se alienta?',
        queixa_id: 12,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 12,
    },
    {
        value: 'choro rolongado ou ininterrupto?',
        queixa_id: 12,
    },
    {
        value: 'Criança quente?',
        queixa_id: 12,
    },
    //13
    {
        value: 'Hipoglicemia?',
        queixa_id: 13,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 13,
    },
    {
        value: 'Criança quente?',
        queixa_id: 13,
    },
    {
        value: 'vómitos persistentes?',
        queixa_id: 13,
    },
    {
        value: 'dor moderada?',
        queixa_id: 13,
    },
    //14
    {
        value: 'fazes pretas ou raiadas de sangue?',
        queixa_id: 14,
    },
    {
        value: 'historia de hematemeses ?',
        queixa_id: 14,
    },
    {
        value: 'sinas de desidratração?',
        queixa_id: 14,
    },
    {
        value: 'vómitos persistentes?',
        queixa_id: 14,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 14,
    },
    {
        value: 'Criança quente?',
        queixa_id: 14,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 14,
    },

    //15
    {
        value: 'SaO2 baixa?',
        queixa_id: 15,
    },
    {
        value: 'historia de hemoptise?',
        queixa_id: 15,
    },
    {
        value: 'dor pleurítica?',
        queixa_id: 15,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 15,
    },
    {
        value: ' PEFR baixo?',
        queixa_id: 15,
    },

    //16
    {
        value: 'SaO2 baixa?',
        queixa_id: 16,
    },
    {
        value: 'historia de hemoptise?',
        queixa_id: 16,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 16,
    },
    {
        value: 'dor pleuritica?',
        queixa_id: 16,
    },
    {
        value: 'PEFR baixo?',
        queixa_id: 16,
    },
    //17
    {
        value: 'historia psiquiátrica significativa?',
        queixa_id: 17,
    },
    {
        value: 'risco moderado de Agressão a terceiros ?',
        queixa_id: 17,
    },
    {
        value: 'risco moderado de autro-Agressão?',
        queixa_id: 17,
    },
    {
        value: 'anustia marcada?',
        queixa_id: 17,
    },
    {
        value: 'comportamento disruptivo?',
        queixa_id: 17,
    },

    //18
    {
        value: 'dor testicular?',
        queixa_id: 18,
    },
    {
        value: 'exantema eritemtoso ou bolhoso?',
        queixa_id: 18,
    },
    {
        value: 'imunossupressão conhecida?',
        queixa_id: 18,
    },
    {
        value: 'dor á mobilização das articulações?',
        queixa_id: 18,
    },
    {
        value: 'articulaçãos quente?',
        queixa_id: 18,
    },
    {
        value: 'dor moderada?',
        queixa_id: 18,
    },

    //19
    {
        value: 'possível ravidez?',
        queixa_id: 19,
    },
    {
        value: 'dor que irradia para o ombro?',
        queixa_id: 19,
    },
    {
        value: 'fazes pretas ou raiadas de sangue?',
        queixa_id: 19,
    },
    {
        value: 'historia de hematemeses?',
        queixa_id: 19,
    },
    {
        value: 'vómitos perisistentes?',
        queixa_id: 19,
    },
    {
        value: 'adulto quente?',
        queixa_id: 19,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 19,
    },

    //20
    {
        value: 'sinais de dor moderada?',
        queixa_id: 20,
    },
    {
        value: 'inconsolavel pelos pais?',
        queixa_id: 20,
    },
    {
        value: 'massa abdominal visivel',
        queixa_id: 20,
    },
    {
        value: 'fazes pretas ou raiadasde sangue?',
        queixa_id: 20,
    },
    {
        value: 'historia de hematemeses?',
        queixa_id: 20,
    },
    {
        value: 'vómitos presistentes?',
        queixa_id: 20,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 20,
    },
    {
        value: 'Criança quente?',
        queixa_id: 20,
    },

    //21
    {
        value: 'traumatismo direicto da reão cervical?',
        queixa_id: 21,
    },
    {
        value: 'novos sintomas e/ou sinais neurológico?',
        queixa_id: 21,
    },
    {
        value: 'adulto quente',
        queixa_id: 21,
    },
    {
        value: 'Criança quente?',
        queixa_id: 21,
    },
    {
        value: 'dor moderada?',
        queixa_id: 21,
    },

    //22
    {
        value: 'historia de viagem ao estrageiro?',
        queixa_id: 22,
    },
    {
        value: 'instalação súbita?',
        queixa_id: 22,
    },
    {
        value: 'adulto quente',
        queixa_id: 22,
    },
    {
        value: 'Criança quente?',
        queixa_id: 22,
    },
    {
        value: 'dor moderada?',
        queixa_id: 22,
    },

    //23
    {
        value: 'Novos sintomas e/ou sinais neurológico?',
        queixa_id: 23,
    },
    {
        value: 'traumatismo directo da região lombar ?',
        queixa_id: 23,
    },
    {
        value: 'imcapacidade de andar?',
        queixa_id: 23,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 23,
    },
    {
        value: 'Criança quente?',
        queixa_id: 23,
    },
    {
        value: 'Colica?',
        queixa_id: 23,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 23,
    },
    {
        value: 'dor moderada?',
        queixa_id: 23,
    },

    //24
    {
        value: 'celulite escrotal?',
        queixa_id: 24,
    },
    {
        value: 'cólica?',
        queixa_id: 24,
    },
    {
        value: 'vómitos presistentes?',
        queixa_id: 24,
    },
    {
        value: 'adulto quente?',
        queixa_id: 24,
    },
    {
        value: 'Criança quente?',
        queixa_id: 24,
    },
    {
        value: 'dor moderado?',
        queixa_id: 24,
    },

    //25
    {
        value: 'dor pleurítica?',
        queixa_id: 25,
    },
    {
        value: 'vómitos presistentes?',
        queixa_id: 25,
    },
    {
        value: 'História cardiaca significativa?',
        queixa_id: 25,
    },
    {
        value: 'adulto quente?',
        queixa_id: 25,
    },
    {
        value: 'dor moderada?',
        queixa_id: 25,
    },

    //26
    {
        value: 'Alteração do estado consciência totalmente atribuivel ao alcool?',
        queixa_id: 26,
    },
    {
        value: 'Novos sintomas e/ou sinais neurológico?',
        queixa_id: 26,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 26,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 26,
    },
    {
        value: 'historia T.C.E.?',
        queixa_id: 26,
    },

    //27
    {
        value: 'exantema eritematoso ou bolhoso?',
        queixa_id: 27,
    },
    {
        value: 'historia inadequada?',
        queixa_id: 27,
    },
    {
        value: 'adulto quente ?',
        queixa_id: 27,
    },
    {
        value: 'Criança quente ?',
        queixa_id: 27,
    },
    {
        value: 'dor moderado ?',
        queixa_id: 27,
    },

    //28
    {
        value: 'historia de T.C.E.?',
        queixa_id: 28,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 28,
    },
    {
        value: 'historia inadequada?',
        queixa_id: 28,
    },
    {
        value: 'novos sintomas e/ou sinais neurológico?',
        queixa_id: 28,
    },
    {
        value: 'adulto quente?',
        queixa_id: 28,
    },
    {
        value: 'dor moderada?',
        queixa_id: 28,
    },

    //29
    {
        value: 'mortalidade moderada',
        queixa_id: 29,
    },
    {
        value: 'exotema eritematoso ou bolhoso?',
        queixa_id: 29,
    },
    {
        value: 'historia inadequada?',
        queixa_id: 29,
    },
    {
        value: 'SaO2 baixo?',
        queixa_id: 29,
    },
    {
        value: 'Dor moderada?',
        queixa_id: 29,
    },

    //30
    {
        value: 'historia inapropriada',
        queixa_id: 30,
    },
    {
        value: 'pequenas Hemorragia incontrolavel?',
        queixa_id: 30,
    },
    {
        value: 'novos sintoma e/ou sinais neurológico?',
        queixa_id: 30,
    },
    {
        value: 'dor severa?',
        queixa_id: 30,
    },

    //31
    {
        value: 'pequenas Hemorragia incontrolavel',
        queixa_id: 31,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 31,
    },
    {
        value: 'historia d clinica significativa?',
        queixa_id: 31,
    },
    {
        value: 'Alteração de coagulação',
        queixa_id: 31,
    },
    {
        value: 'dor moderada?',
        queixa_id: 31,
    },

    //32

    {
        value: 'dor abdominal?',
        queixa_id: 32,
    },
    {
        value: 'pressão arterial elevada?',
        queixa_id: 32,
    },
    {
        value: 'historia de traumatismo?',
        queixa_id: 32,
    },
    {
        value: 'historia inadequada?',
        queixa_id: 32,
    },
    {
        value: 'dor que irradia para o ombro?',
        queixa_id: 32,
    },
    {
        value: 'Hemorragia vaginal?',
        queixa_id: 32,
    },
    {
        value: 'adulto quente?',
        queixa_id: 32,
    },
    {
        value: 'dor moderada?',
        queixa_id: 32,
    },

    //33

    {
        value: 'fezes preta ou raiadas do sangue ?',
        queixa_id: 33,
    },
    {
        value: 'historia de hematemeses?',
        queixa_id: 33,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 33,
    },
    {
        value: 'vómitos persistentes?',
        queixa_id: 33,
    },
    {
        value: 'dor moderada?',
        queixa_id: 33,
    },

    //34

    {
        value: 'dor abdominal?',
        queixa_id: 34,
    },
    {
        value: 'dor que errita para o ombro?',
        queixa_id: 34,
    },
    {
        value: 'Alteração da coagulação?',
        queixa_id: 34,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 34,
    },
    {
        value: 'possibilidade de gravidez?',
        queixa_id: 34,
    },
    {
        value: 'dor moderada?',
        queixa_id: 34,
    },

    //35
    {
        value: 'intalação súbita?',
        queixa_id: 35,
    },
    {
        value: 'historia de hemoptise?',
        queixa_id: 35,
    },
    {
        value: 'hestoria de viagem ao estrangeiro?',
        queixa_id: 35,
    },
    {
        value: 'novos sintoma e/ou sinais neurológico?',
        queixa_id: 35,
    },
    {
        value: 'Alteração de imunidade conhecida?',
        queixa_id: 35,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 35,
    },
    {
        value: 'exantema eritematoso ou bolhoso?',
        queixa_id: 35,
    },

    //36
    {
        value: 'dor á mobilização das articulaçãos?',
        queixa_id: 36,
    },
    {
        value: 'articulaçãos quente?',
        queixa_id: 36,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 36,
    },
    {
        value: 'Criança quente?',
        queixa_id: 36,
    },
    {
        value: 'dor moderada?',
        queixa_id: 36,
    },

    //37
    {
        value: 'dor pleurítica?',
        queixa_id: 37,
    },
    {
        value: 'Pequena Hemorragia inconsolavel?',
        queixa_id: 37,
    },
    {
        value: 'Alteração da coagulação?',
        queixa_id: 37,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 37,
    },
    {
        value: 'dor moderada?',
        queixa_id: 37,
    },

    //38

    {
        value: 'saO2 baixa?',
        queixa_id: 38,
    },
    {
        value: 'Pequena Hemorragia inconsolavel?',
        queixa_id: 38,
    },
    {
        value: 'exantema eritematoso ou bolhoso?',
        queixa_id: 38,
    },
    {
        value: 'risco moderado de morte por envenenamento?',
        queixa_id: 38,
    },
    {
        value: 'adulto quente?',
        queixa_id: 38,
    },
    {
        value: 'Criança quente?',
        queixa_id: 38,
    },
    {
        value: 'dor moderada?',
        queixa_id: 38,
    },
    {
        value: 'prurido moderado?',
        queixa_id: 38,
    },

    //39

    {
        value: 'sinais de dor moderada?',
        queixa_id: 39,
    },
    {
        value: 'choro prolongado ou ininterrupto?',
        queixa_id: 39,
    },
    {
        value: 'inconsolavel pelos pais ?',
        queixa_id: 39,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 39,
    },
    {
        value: 'sinais de desidratração?',
        queixa_id: 39,
    },
    {
        value: 'não urina?',
        queixa_id: 39,
    },
    {
        value: 'não se alimenta?',
        queixa_id: 39,
    },
    {
        value: 'Criança quente?',
        queixa_id: 39,
    },

    //40

    {
        value: 'com palpitações?',
        queixa_id: 40,
    },
    {
        value: 'historia de perda de consciência ?',
        queixa_id: 40,
    },
    {
        value: 'historia cardiaca significativa ?',
        queixa_id: 40,
    },
    {
        value: 'adulto quente?',
        queixa_id: 40,
    },
    {
        value: 'Criança quente?',
        queixa_id: 40,
    },

    //41

    {
        value: 'pequena Hemorragia incontrolavel ?',
        queixa_id: 41,
    },
    {
        value: 'avulsão dentaria recente?',
        queixa_id: 41,
    },
    {
        value: 'Alteração de coagulação ?',
        queixa_id: 41,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 41,
    },
    {
        value: 'adulto quente?',
        queixa_id: 41,
    },
    {
        value: 'Criança quente?',
        queixa_id: 41,
    },
    {
        value: 'dor moderada?',
        queixa_id: 41,
    },

    //42
    {
        value: 'Deformação grosseira?',
        queixa_id: 42,
    },
    {
        value: 'Alteração de coagulação ?',
        queixa_id: 42,
    },
    {
        value: 'recente redução da acuidade visual?',
        queixa_id: 42,
    },
    {
        value: 'Pequena Hemorragia incontrolavel?',
        queixa_id: 42,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 42,
    },
    {
        value: 'avulsão dentária recente?',
        queixa_id: 42,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 42,
    },
    {
        value: 'adulto quente?',
        queixa_id: 42,
    },
    {
        value: 'Criança quente?',
        queixa_id: 42,
    },
    {
        value: 'dor moderada?',
        queixa_id: 42,
    },

    //43
    {
        value: 'Dor pleuritica?',
        queixa_id: 43,
    },
    {
        value: 'Deformação grosseira?',
        queixa_id: 43,
    },
    {
        value: 'fractura exposta?',
        queixa_id: 43,
    },
    {
        value: 'Pequena Hemorragia incontrolavel?',
        queixa_id: 43,
    },
    {
        value: 'novos sinais e/ou sintomas neurológico?',
        queixa_id: 43,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 43,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 43,
    },
    {
        value: 'dor moderada?',
        queixa_id: 43,
    },

    //44
    {
        value: 'recente reduce de acuidade visual?',
        queixa_id: 44,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 44,
    },
    {
        value: 'Adulto quente?',
        queixa_id: 44,
    },
    {
        value: 'Criança quente?',
        queixa_id: 44,
    },
    {
        value: 'dor moderada?',
        queixa_id: 44,
    },

    //45
    {
        value: 'Pequena Hemorragia incontrolavel?',
        queixa_id: 45,
    },
    {
        value: 'historia de T.C.E.?',
        queixa_id: 45,
    },
    { value: 'vómitos perisistentes?', queixa_id: 45 },
    {
        value: 'historia inapropriada?',
        queixa_id: 45,
    },
    {
        value: 'adulto quente?',
        queixa_id: 45,
    },
    {
        value: 'Criança quente?',
        queixa_id: 45,
    },
    {
        value: 'dor moderada?',
        queixa_id: 45,
    },
    {
        value: 'Alteração de coagulação?',
        queixa_id: 45,
    },
    {
        value: 'História inapropriada?',
        queixa_id: 45,
    },

    //46
    {
        value: 'Colica?',
        queixa_id: 46,
    },
    {
        value: 'hematúria clinicamente evidente',
        queixa_id: 46,
    },
    { value: 'retenção urinaria/ oligoanúria?', queixa_id: 46 },
    {
        value: 'vómitos perisistentes?',
        queixa_id: 46,
    },
    {
        value: 'adulto quente?',
        queixa_id: 46,
    },
    {
        value: 'Criança quente?',
        queixa_id: 46,
    },
    {
        value: 'dor moderada?',
        queixa_id: 46,
    },

    //47
    {
        value: 'historia de perda de consciência?',
        queixa_id: 47,
    },
    {
        value: 'alteração de coagolação?',
        queixa_id: 47,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 47,
    },
    { value: 'pequena hemorragia incontrolavel?', queixa_id: 47 },
    {
        value: 'novos sintomas e/ou sinas?',
        queixa_id: 47,
    },
    {
        value: 'deformção grosseira?',
        queixa_id: 47,
    },
    {
        value: 'farctura exposta?',
        queixa_id: 47,
    },
    {
        value: 'dor moderada?',
        queixa_id: 47,
    },

    //48
    {
        value: 'saO2 baixa?',
        queixa_id: 48,
    },
    {
        value: 'inalação de fumos?',
        queixa_id: 48,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 48,
    },
    { value: 'lesão eléctrica?', queixa_id: 48 },
    {
        value: 'queimadora quimica?',
        queixa_id: 48,
    },
    {
        value: 'dor moderada?',
        queixa_id: 48,
    },

    //49
    {
        value: 'mortalidade moderada?',
        queixa_id: 49,
    },
    {
        value: 'risco moderado de Auto-agressão?',
        queixa_id: 49,
    },
    {
        value: 'historia psiquiátrica significativa?',
        queixa_id: 49,
    },
    {
        value: 'historia de perda de consciência?',
        queixa_id: 49,
    },
    { value: 'angústia marcada?', queixa_id: 49 },
    {
        value: 'historia inapropriada?',
        queixa_id: 49,
    },
    {
        value: 'saO2?',
        queixa_id: 49,
    },

    //50
    {
        value: 'hestoria de perda de consciência?',
        queixa_id: 50,
    },
    {
        value: 'Alteração da coagulação?',
        queixa_id: 50,
    },
    {
        value: 'historia inapropriada?',
        queixa_id: 50,
    },
    {
        value: 'pequena Hemorragia incontrolavel?',
        queixa_id: 50,
    },
    { value: 'vómitos percistente?', queixa_id: 50 },
    {
        value: 'novos sintomas e/ou sinais neurológico?',
        queixa_id: 50,
    },
    {
        value: 'dor moderada?',
        queixa_id: 50,
    },
    {
        value: 'preenchimento>2/seg?',
        queixa_id: 51,
    },
    {
        value: 'pulso>120/min?',
        queixa_id: 51,

        //52
    },
    {
        value: 'TRTS 11?',
        queixa_id: 51,
    },
];

export const AZUL = [
    {
        value: 'edema?',
        queixa_id: 1,
    },
    {
        value: 'Deformação?',
        queixa_id: 1,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 1,
    },
    {
        value: 'Problema recente?',
        queixa_id: 1,
    },

    //2
    {
        value: 'Iflamação Local',
        queixa_id: 2,
    },
    {
        value: 'Dor Ligeira < 7dias',
        queixa_id: 2,
    },
    {
        value: 'Prurido ligeiro?',
        queixa_id: 2,
    },
    {
        value: 'Problema recente?',
        queixa_id: 2,
    },

    //3
    {
        value: 'broncospasmo',
        queixa_id: 3,
    },
    {
        value: 'provável infecção respiratoria',
        queixa_id: 3,
    },
    {
        value: 'Problema recente?',
        queixa_id: 3,
    },

    //6
    {
        value: 'Subfebril(Fabricula)',
        queixa_id: 6,
    },
    {
        value: 'vómitos?',
        queixa_id: 6,
    },
    {
        value: 'Dor Ligeira < 7dias??',
        queixa_id: 6,
    },
    {
        value: 'Problema recente?',
        queixa_id: 6,
    },
    //8
    {
        value: 'Subfebril (Fabricula)?',
        queixa_id: 8,
    },
    {
        value: 'cefaleias?',
        queixa_id: 8,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 8,
    },
    {
        value: 'Problema recente?',
        queixa_id: 8,
    },

    //9
    {
        value: 'inflamção Local?',
        queixa_id: 9,
    },
    {
        value: 'infecção Local?',
        queixa_id: 9,
    },
    {
        value: 'olho vermelho?',
        queixa_id: 9,
    },
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 9,
    },
    {
        value: 'problema recente?',
        queixa_id: 9,
    },
    //10
    {
        value: 'sinais de dor<7 dias?',
        queixa_id: 10,
    },
    {
        value: 'Subfebril (Febricula)?',
        queixa_id: 10,
    },
    {
        value: 'Deformação?',
        queixa_id: 10,
    },
    {
        value: 'edema?',
        queixa_id: 10,
    },
    {
        value: 'problema recente?',
        queixa_id: 10,
    },
    {
        //11
        value: 'sinais de dor Ligeira <7 dias?',
        queixa_id: 11,
    },
    {
        value: 'Subfebril (Febricula)?',
        queixa_id: 11,
    },
    {
        value: 'comportamento estranhos?',
        queixa_id: 11,
    },
    {
        value: 'problema recente?',
        queixa_id: 11,
    },

    //12
    {
        value: 'Dor Ligeira < 7dias',
        queixa_id: 12,
    },
    {
        value: 'Subfebril (Febricula)',
        queixa_id: 12,
    },
    {
        value: 'comortamento estranho?',
        queixa_id: 12,
    },
    {
        value: 'Problema recente?',
        queixa_id: 12,
    },
    //13
    {
        value: 'Subfebril (Fabricula)?',
        queixa_id: 13,
    },
    {
        value: 'vómitos?',
        queixa_id: 13,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 13,
    },
    {
        value: 'Problema recente?',
        queixa_id: 13,
    },
    //14
    {
        value: 'Subfebril?',
        queixa_id: 14,
    },
    {
        value: 'vómitos?',
        queixa_id: 14,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 14,
    },
    {
        value: 'Problema recente?',
        queixa_id: 14,
    },

    //15
    {
        value: 'brancospasmo?',
        queixa_id: 15,
    },
    {
        value: 'provável infecção respiratoria?',
        queixa_id: 15,
    },
    {
        value: 'traumatismo torácico?',
        queixa_id: 15,
    },
    {
        value: 'subfebril (Febricula)?',
        queixa_id: 15,
    },
    {
        value: 'Problema recente?',
        queixa_id: 15,
    },

    //16
    {
        value: 'brancospasmo?',
        queixa_id: 16,
    },
    {
        value: 'provável inecção respiratoria?',
        queixa_id: 16,
    },
    {
        value: 'traumatismo torácico?',
        queixa_id: 16,
    },
    {
        value: 'Problema recente?',
        queixa_id: 16,
    },

    //18
    {
        value: 'Subfebril(Fabricula)',
        queixa_id: 18,
    },
    {
        value: 'corrimento?',
        queixa_id: 18,
    },
    {
        value: 'Dor Ligeira < 7dias??',
        queixa_id: 18,
    },
    {
        value: 'Problema recente?',
        queixa_id: 18,
    },

    //19
    {
        value: 'vómitos?',
        queixa_id: 19,
    },
    {
        value: 'Dor Ligeira < 7dias??',
        queixa_id: 19,
    },
    {
        value: 'Problema recente?',
        queixa_id: 19,
    },
    //20
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 20,
    },
    {
        value: 'vómitos?',
        queixa_id: 20,
    },
    {
        value: 'Problema recente?',
        queixa_id: 20,
    },
    //21
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 21,
    },
    {
        value: 'problema recente?',
        queixa_id: 21,
    },

    //22
    {
        value: 'Subfebril(Fabricula)?',
        queixa_id: 22,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 22,
    },
    {
        value: 'Problema recente?',
        queixa_id: 22,
    },

    //23
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 23,
    },
    {
        value: 'Problema recente?',
        queixa_id: 23,
    },

    //24
    {
        value: 'tralmatismo escrotal?',
        queixa_id: 24,
    },
    {
        value: 'vómitos?',
        queixa_id: 24,
    },
    {
        value: 'Dor Ligeira < 7dias??',
        queixa_id: 24,
    },
    {
        value: 'Problema recente?',
        queixa_id: 24,
    },

    //25
    {
        value: 'vómitos?',
        queixa_id: 25,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 25,
    },
    {
        value: 'Subfebril (Febricula)??',
        queixa_id: 25,
    },
    {
        value: 'Problema recente?',
        queixa_id: 25,
    },

    //26
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 26,
    },
    {
        value: 'traumatismo recente?',
        queixa_id: 26,
    },

    //27
    {
        value: 'Subfebril (Febricula)?',
        queixa_id: 27,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 27,
    },
    {
        value: 'Prurido ligeiro?',
        queixa_id: 27,
    },
    {
        value: 'Problema recente?',
        queixa_id: 27,
    },

    //28
    {
        value: 'Subfebril (Febricula)?',
        queixa_id: 28,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 28,
    },
    {
        value: 'Problema recente?',
        queixa_id: 28,
    },

    //29
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 29,
    },
    {
        value: 'Problema recente?',
        queixa_id: 29,
    },

    //30
    {
        value: 'infecção Local?',
        queixa_id: 30,
    },
    {
        value: 'inflamção Local?',
        queixa_id: 30,
    },
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 30,
    },
    {
        value: 'traumatismo recente?',
        queixa_id: 30,
    },

    //33
    {
        value: 'vómitos?',
        queixa_id: 33,
    },
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 33,
    },
    {
        value: 'Problema recente?',
        queixa_id: 33,
    },

    //34
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 34,
    },
    {
        value: 'Problema recente?',
        queixa_id: 34,
    },

    //35
    {
        value: 'Subfebril(Febricula)?',
        queixa_id: 35,
    },
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 35,
    },
    {
        value: 'Problema recente?',
        queixa_id: 35,
    },

    //36
    {
        value: 'Subfebril(Febricula)?',
        queixa_id: 36,
    },
    {
        value: 'dor ligeira <7 dias?',
        queixa_id: 36,
    },
    {
        value: 'Problema recente?',
        queixa_id: 36,
    },

    //37
    {
        value: 'inflamção Local?',
        queixa_id: 37,
    },
    {
        value: 'infecção Local?',
        queixa_id: 37,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 37,
    },
    {
        value: 'Problema recente?',
        queixa_id: 37,
    },

    //38
    {
        value: 'inlamação Local?',
        queixa_id: 38,
    },
    {
        value: 'inecção Local?',
        queixa_id: 38,
    },
    {
        value: 'Dor Ligeira < 7dias?',
        queixa_id: 38,
    },
    {
        value: 'prurido ligeiro?',
        queixa_id: 38,
    },
    {
        value: 'Problema recente?',
        queixa_id: 38,
    },

    //39
    {
        value: 'sinais de dor ligeira< 7dias?',
        queixa_id: 39,
    },
    {
        value: 'Subfebril(Febricula)?',
        queixa_id: 39,
    },
    {
        value: 'comportamento estranho?',
        queixa_id: 39,
    },
    {
        value: 'Problema recente?',
        queixa_id: 39,
    },

    //40
    {
        value: 'Problema recente?',
        queixa_id: 40,
    },

    //41
    {
        value: 'Subfebril(Febricula)?',
        queixa_id: 41,
    },
    {
        value: 'edma da face?',
        queixa_id: 41,
    },
    {
        value: 'sinais de dor ligeira< 7dias?',
        queixa_id: 41,
    },
    {
        value: 'Problema recente?',
        queixa_id: 41,
    },

    //42
    {
        value: 'Subfebril?',
        queixa_id: 42,
    },
    {
        value: 'diplopia?',
        queixa_id: 42,
    },
    {
        value: 'hematoma do pavulhão auricular?',
        queixa_id: 42,
    },
    {
        value: 'Alteração de sensibilidade na face?',
        queixa_id: 42,
    },
    {
        value: 'edema facial?',
        queixa_id: 42,
    },
    {
        value: 'olho vermelho?',
        queixa_id: 42,
    },
    {
        value: 'dor ligeira < 7 dias?',
        queixa_id: 42,
    },
    {
        value: 'Problema recente?',
        queixa_id: 42,
    },

    //43
    {
        value: 'Deformação?',
        queixa_id: 43,
    },
    {
        value: 'edma?',
        queixa_id: 43,
    },
    {
        value: 'dor ligeira < 7 dias?',
        queixa_id: 43,
    },
    {
        value: 'problema recente?',
        queixa_id: 43,
    },

    //44
    {
        value: 'olhos vermelho?',
        queixa_id: 44,
    },
    {
        value: 'sensação de corpo estranho?',
        queixa_id: 44,
    },
    {
        value: 'diplopia?',
        queixa_id: 44,
    },
    {
        value: 'dor ligeira < 7 dias?',
        queixa_id: 44,
    },
    {
        value: 'problema recente?',
        queixa_id: 44,
    },

    //45
    {
        value: 'Subfebril(Febricula)?',
        queixa_id: 45,
    },
    {
        value: 'perda recente de audição?',
        queixa_id: 45,
    },
    {
        value: 'hematoma no pavilhão auricular?',
        queixa_id: 45,
    },
    {
        value: 'vertigens?',
        queixa_id: 45,
    },
    {
        value: 'dor ligeira < 7 dias?',
        queixa_id: 45,
    },
    {
        value: 'problema recente?',
        queixa_id: 45,
    },

    //46
    {
        value: 'vómitos?',
        queixa_id: 46,
    },
    {
        value: 'disúria?',
        queixa_id: 46,
    },
    {
        value: 'dor ligeira <7 dia?',
        queixa_id: 46,
    },
    {
        value: 'Problema recente?',
        queixa_id: 46,
    },

    //47
    {
        value: 'vómitos?',
        queixa_id: 47,
    },
    {
        value: 'disúria?',
        queixa_id: 47,
    },
    {
        value: 'dor ligeira <7 dia?',
        queixa_id: 47,
    },
    {
        value: 'Problema recente?',
        queixa_id: 47,
    },

    //48
    {
        value: 'inlamação Local?',
        queixa_id: 48,
    },
    {
        value: 'infecção Local?',
        queixa_id: 48,
    },
    {
        value: 'dor ligeira <7 dia?',
        queixa_id: 48,
    },
    {
        value: 'Problema recente?',
        queixa_id: 48,
    },
    //50
    {
        value: 'hematoma no couro cabeludo?',
        queixa_id: 50,
    },
    {
        value: 'vómetos?',
        queixa_id: 50,
    },
    {
        value: 'dor ligeira <7 dia?',
        queixa_id: 50,
    },
    {
        value: 'Problema recente?',
        queixa_id: 50,
    },
];

export const VERDE = [
    {
        value: 'Edma',
        queixa_id: 1,
    },
    {
        value: 'Deformação',
        queixa_id: 1,
    },
    {
        value: 'Dor Ligeira < 7dias',
        queixa_id: 1,
    },
    {
        value: 'Problema recente',
        queixa_id: 1,
    },

    //3
    {
        value: 'broncospasmo?',
        queixa_id: 3,
    },
    {
        value: 'provável infecção respiratoria?',
        queixa_id: 3,
    },
    {
        value: 'Problema recente?',
        queixa_id: 3,

        //5
        value: 'sinais de dor Ligeira < a 7 dias?',
        queixa_id: 5,
    },
    {
        value: 'subfebril (Febricula)?',
        queixa_id: 5,
    },
    {
        value: 'comportamento estranhos?',
        queixa_id: 5,
    },
    {
        value: 'Problema recente',
        queixa_id: 5,
    },

    //32

    {
        value: 'subfebril (Febricula)?',
        queixa_id: 32,
    },
    {
        value: 'dor ligeira?',
        queixa_id: 32,
    },
    {
        //51
        value: 'subfebril (Febricula)?',
        queixa_id: 51,
    },
];
