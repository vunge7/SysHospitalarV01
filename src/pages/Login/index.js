import React, { useContext } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';
import { AuthContext } from '../../contexts/auth';
import { users } from '../../util/db';
import { blue } from '@mui/material/colors';

import fundoLogo from '../../assets/images/fundo_logo.jpg';

const Login = () => {
    const { signIn } = useContext(AuthContext);

    const onFinish = (values) => {
        let userName = values.username;
        let password = values.password;
        console.log('Username ' + values.username);
        console.log('Password ' + values.password);
        //signIn(1, values.username);

        let user = {
            id: 0,
            username: '',
            tipo: '',
        };
        users.map(
            (item, index) => {
                if (item.username === userName && item.password === password) {
                    user = item;
                    return;
                }
            },
            userName,
            password,
            user
        );
        console.log('User  ', user);

        if (user.id !== 0) {
            signIn(user);
        }
    };
    return (
        <div
            id="container"
            style={{
                //marginTop: '30vh',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'start',
                height: '100vh',
                marginLeft: -255,
            }}
        >
            <div id="image" style={{ width: 50 + '%' }}>
                <img
                    src={fundoLogo}
                    style={{ width: 100 + '%', height: '100vh' }}
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
                    marginLeft: 15 + '%',
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
                    <Button block type="primary" htmlType="submit">
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
export default Login;
