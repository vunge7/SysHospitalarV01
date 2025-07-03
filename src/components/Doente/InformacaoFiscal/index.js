import React from 'react';
import { Flex, Card, Form, Input, Select } from 'antd';

function InformacaoFiscal(props) {
    return (
        <Flex gap="small" vertical>
            <Flex gap="small" horizontal>
                <Card bordered={true} style={{ width: 100 + '%' }}>
                    <Form
                        name="info-fiscais"
                        labelCol={{
                            span: 6,
                        }}
                        wrapperCol={{
                            span: 16,
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: false,
                        }}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="NIF"
                            name="nif"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor insira o NIF',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Card>
            </Flex>
            <Flex gap="small" horizontal>
                <Flex gap="small" vertical>
                    <Card
                        title="Classificação"
                        bordered={true}
                        style={{ width: 500 }}
                    >
                        <Form
                            name="classificacao"
                            labelCol={{
                                span: 6,
                            }}
                            wrapperCol={{
                                span: 16,
                            }}
                            style={{
                                maxWidth: 600,
                            }}
                            initialValues={{
                                remember: false,
                            }}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Profissão"
                                name="profissao"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por seleccione a profissão',
                                    },
                                ]}
                                style={{
                                    marginBottom: 2,
                                }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Selecione a profissão"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[]}
                                    style={{
                                        width: 200,
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Estado Civil"
                                name="estado-civil"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por seleccione a profissão',
                                    },
                                ]}
                                style={{
                                    marginBottom: 2,
                                }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Selecione o estado civil"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[]}
                                    style={{
                                        width: 200,
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Habitação"
                                name="habitacao"
                                rules={[
                                    {
                                        required: false,
                                    },
                                ]}
                                style={{
                                    marginBottom: 2,
                                }}
                            >
                                <Select
                                    showSearch
                                    placeholder="Selecione a habilitação"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    options={[]}
                                    style={{
                                        width: 200,
                                    }}
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                </Flex>
                <Flex gap="small" vertical>
                    <Card
                        title="Data do Últimos Movimentos"
                        bordered={true}
                        style={{ width: 300 }}
                    >
                        <Form
                            name="data-ultimos-movimentos"
                            labelCol={{
                                span: 6,
                            }}
                            wrapperCol={{
                                span: 16,
                            }}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Débito"
                                style={{
                                    marginBottom: 2,
                                }}
                            >
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Crédito">
                                <Input disabled />
                            </Form.Item>
                        </Form>
                    </Card>
                </Flex>
            </Flex>
        </Flex>
    );
}

export default InformacaoFiscal;
