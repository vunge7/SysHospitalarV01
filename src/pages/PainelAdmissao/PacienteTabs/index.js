import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import {
    profissaoFONTE,
    habiliatacaLiterariaFONTE,
    estadoCivilFONTE,
} from '../../../components/util/utilitarios';



const PacienteTabs = (props) => {
    const [activeTab, setActiveTab] = useState('endereco');
    const tabsRef = useRef({});
    const indicatorRef = useRef(null);

    const updateIndicator = () => {
        const currentTab = tabsRef.current[activeTab];
        if (currentTab && indicatorRef.current) {
            indicatorRef.current.style.width = `${currentTab.offsetWidth}px`;
            indicatorRef.current.style.left = `${currentTab.offsetLeft}px`;
        }
    };

    useEffect(() => {
        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'endereco':
                return (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>País:</label>
                            <select
                                name="paisEndereco"
                                value={props.paisEndereco}
                                onChange={props.handleChange}
                            >
                                <option value="">Selecione o País</option>
                                <option value="Angola">Angola</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Província:</label>
                            <select
                                name="provinciaEndereco"
                                value={props.provinciaEndereco}
                                onChange={props.handleChange}
                            >
                                <option value="">Selecione a Província</option>
                                <option value="Luanda">Luanda</option>
                                <option value="Bengo">Bengo</option>
                                <option value="Huíla">Huíla</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Município:</label>
                            <select
                                name="municipioEndereco"
                                value={props.municipioEndereco}
                                onChange={props.handleChange}
                            >
                                <option value="">Selecione o Município</option>
                                <option value="Belas">Belas</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Endereço:</label>
                            <input
                                name="endereco"
                                value={props.endereco}
                                onChange={props.handleChange}
                            />
                        </div>
                    </div>
                );
            case 'fiscal':
                return (
                    <div className="tab-content">
                        <div className="form-group">
                            <label>Profissão:</label>
                            <select
                                name="profissao"
                                value={props.profissao}
                                onChange={props.handleChange}
                            >
                                <option value="">--Selecione--</option>
                                {profissaoFONTE.map((item) => (
                                    <option key={item.id} value={item.value}>
                                        {item.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Habilitação Literária:</label>
                            <select
                                name="habilitacao"
                                value={props.habilitacao}
                                onChange={props.handleChange}
                            >
                                <option value="">--Selecione--</option>
                                {habiliatacaLiterariaFONTE.map((item) => (
                                    <option key={item.id} value={item.value}>
                                        {item.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado Civil:</label>
                            <select
                                name="estadoCivil"
                                value={props.estadoCivil}
                                onChange={props.handleChange}
                            >
                                <option value="">--Selecione--</option>
                                {estadoCivilFONTE.map((item) => (
                                    <option key={item.id} value={item.value}>
                                        {item.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            case 'nascimento':
                return (
                    <div className="tab-content">
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>* Pai:</label>
                                <input
                                    name="pai"
                                    value={props.pai}
                                    onChange={props.handleChange}
                                />
                            </div>

                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>* Mãe:</label>
                                <input
                                    name="mae"
                                    value={props.mae}
                                    onChange={props.handleChange}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Data de Nascimento:</label>
                                <input
                                    name="dataNascimento"
                                    type="date"
                                    value={props.dataNascimento}
                                    onChange={props.handleChange}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>País:</label>
                                <select
                                    name="paisNascimento"
                                    value={props.paisNascimento}
                                    onChange={props.handleChange}
                                >
                                    <option value="">--Selecione--</option>
                                    <option value="Angola">Angola</option>
                                </select>
                            </div>
                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>Província:</label>
                                <select
                                    name="provinciaNascimento"
                                    value={props.provinciaNascimento}
                                    onChange={props.handleChange}
                                >
                                    <option value="">--Seleccione--</option>
                                    <option value="Luanda">Luanda</option>
                                    <option value="Bengo">Bengo</option>
                                    <option value="Huíla">Huíla</option>
                                </select>
                            </div>
                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>Município:</label>
                                <select
                                    name="municipioNascimento"
                                    value={props.municipioNascimento}
                                    onChange={props.handleChange}
                                >
                                    <option value="">--seleccione--</option>
                                    <option value="Belas">Belas</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Local de Nascimento:</label>
                            <input
                                name="localNascimento"
                                value={props.localNascimento}
                                onChange={props.handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nacionalidade:</label>
                            <input
                                name="nacionalidade"
                                value={props.nacionalidade}
                                onChange={props.handleChange}
                            />
                        </div>
                    </div>
                );
            case 'convenio':
                return <div className="tab-content"></div>;
            case 'empresa':
                return <div className="tab-content"></div>;
            default:
                return null;
        }
    };

    return (
        <div className="patient-tabs">
            <div className="tabs-container">
                <div className="tabs">
                    <div
                        className={`tab ${activeTab === 'endereco' ? 'active' : ''}`}
                        onClick={() => setActiveTab('endereco')}
                    >
                        🏠 Endereço
                    </div>
                    <div
                        className={`tab ${activeTab === 'fiscal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fiscal')}
                    >
                        💳 Informação Fiscal
                    </div>
                    <div
                        className={`tab ${activeTab === 'nascimento' ? 'active' : ''}`}
                        onClick={() => setActiveTab('nascimento')}
                    >
                        🎂 Nascimento
                    </div>
                    <div
                        className={`tab ${activeTab === 'convenio' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seguradora')}
                    >
                        🛡️ Convénio
                    </div>

                    <div
                        className={`tab ${activeTab === 'empresa' ? 'active' : ''}`}
                        onClick={() => setActiveTab('empresa')}
                    >
                        🏢 Empresa
                    </div>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default PacienteTabs;
