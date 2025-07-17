import React, { useContext, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';
import { AuthContext } from '../../contexts/auth';
import { api } from '../../service/api';
import fundoLogo from '../../assets/images/fundo_logo.jpg';

const Login = () => {
    const { signIn } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/api/auth/login', {
                username: values.username,
                password: values.password,
            });
            // Salva token e dados do usuário
            localStorage.setItem('token', response.data.token);
            const user = {
                id: response.data.id,
                username: response.data.username,
                tipo: response.data.tipo,
            };
            signIn(user);
        } catch (err) {
            setError('Usuário ou senha inválidos');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div
            id="container"
            style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'start',
                height: '100vh',
                marginLeft: -255,
            }}
        >
            <div id="image" style={{ width: '50%' }}>
                <img
                    src={fundoLogo}
                    style={{ width: '100%', height: '100vh' }}
                    alt=""
                />
            </div>

            <Form
                name="login"
                initialValues={{
                    remember: true,
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'start',
                    marginLeft: '15%',
                    marginTop: '35vh',
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor  digite seu Username!',
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor digite a sua Password!',
                        },
                    ]}
                >
                    <Input
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Flex justify="space-between" align="center">
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            noStyle
                        >
                            <Checkbox>Lembra-me</Checkbox>
                        </Form.Item>
                        <a href="">Esqueceu a password</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>
                        Log in
                    </Button>
                </Form.Item>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </Form>
        </div>
    );
};
export default Login;
