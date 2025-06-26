export const users = [
    {
        id: 1,
        username: 'root',
        password: '1234',
        tipo: 'master',
    },
    {
        id: 2,
        username: 'domingos.vunge',
        password: '1234',
        tipo: 'medico',
    },
    {
        id: 3,
        username: 'martinho.luis',
        password: '1234',
        tipo: 'enfermeiro',
    },
];

export const Habitacaoes = [
    {
        value: 'Ensino de Base',
        label: 'Ensino de Base',
    },
    {
        value: 'Técnico Médio',
        label: 'Técnico Médio',
    },
    {
        value: 'Bacharel',
        label: 'Bacharel',
    },
    {
        value: 'Licenciado(a)',
        label: 'Licenciado(a)',
    },
    {
        value: 'Mestre',
        label: 'Mestre',
    },
    {
        value: 'Doctor',
        label: 'Doctor',
    },
];

export const Profissoes = [
    {
        value: 'Farmácia',
        label: 'Farmácia',
    },
    {
        value: 'Fisioterapia',
        label: 'Fisioterapia',
    },
    {
        value: 'Fonoaudiologia',
        label: 'Fonoaudiologia',
    },
    {
        value: 'Medicina',
        label: 'Medicina',
    },
];

export const EstadoCivil = [
    {
        value: 'Solteiro(a)',
        label: 'Solteiro(a)',
    },
    {
        value: 'Casado(a)',
        label: 'Casado(a)',
    },
    {
        value: 'Viuvo(a)',
        label: 'Viuvo(a)',
    },
    {
        value: 'Divorciado(a)',
        label: 'Divorciado(a)',
    },
    {
        value: 'Separado Juridicamento',
        label: 'Separado Juridicamento',
    },
];
export const Nacionalidade = [
    {
        value: 'Angolana',
        label: 'Angolana',
    },
    {
        value: 'Brasileira',
        label: 'Brasileira',
    },
    {
        value: 'Americana',
        label: 'Americana',
    },
    {
        value: 'Portuguesa',
        label: 'Postuguesa',
    },
    {
        value: 'Italiana',
        label: 'Italiana',
    },
];

export const Sexo = [
    {
        value: 'Masculino',
        label: 'Masculino',
    },
    {
        value: 'Femenino',
        label: 'Femenino',
    },
];

export const Raca = [
    {
        value: 'Negra',
        label: 'Negra(Africanos)',
    },
    {
        value: 'Branca',
        label: 'Branca(Europeus)',
    },
    {
        value: 'Amarela',
        label: 'Amarela(Asiáticos)',
    },
    {
        value: 'Vermelha',
        label: 'Vermelha(Americanos e Australianos)',
    },
];

export const paisesOptions = [
    {
        value: 0,
        label: 'Angola',
        provincia: [
            {
                value: 0,
                label: 'Luanda',
                municipio: [
                    {
                        value: 0,
                        label: 'Ingombota',
                    },
                    {
                        value: 1,
                        label: 'Kilamba Kiaxi',
                    },
                    {
                        value: 2,
                        label: 'Luanda',
                    },

                    {
                        value: 3,
                        label: 'Maianga',
                    },
                ],
            },
            {
                value: 1,
                label: 'Benguela',
                municipio: [
                    {
                        value: 0,
                        label: 'Benguela',
                    },
                    {
                        value: 1,
                        label: 'Lobito',
                    },
                ],
            },
            {
                value: 2,
                label: 'Huambo',
                municipio: [
                    {
                        value: 0,
                        label: 'Huambo',
                    },
                    {
                        value: 1,
                        label: 'Caala',
                    },
                ],
            },
            {
                value: 3,
                label: 'Lubango',
                municipio: [
                    {
                        value: 0,
                        label: 'Lubango',
                    },
                    {
                        value: 1,
                        label: 'Huila',
                    },
                ],
            },
        ],
    },
];
