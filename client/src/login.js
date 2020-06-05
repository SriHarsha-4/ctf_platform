import React from 'react';
import { Input, Button, Icon, Layout, Form, Checkbox, message } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined
} from '@ant-design/icons';

const { Content } = Layout


class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            failedLogin: false,
            errorFetch: false,
            login: true,
            register: false,
            loading: false,
        };
    }

    handleRegister = values => {
        this.setState({loading: true})
        fetch("https://api.irscybersec.tk//v1/account/create", {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": values.username,
                "password": values.password,
                "email": values.email
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then((data) => {
            if (data.success === true) {
                message.success({ content: "Woohoo! Successfully registered, you can now login via the login screen!" })
                this.setState({loading: false})
            }
            else {
                message.error({ content: "Oops. Unknown error" })
            }


        }).catch((error) => {
            message.error({ content: "Oops. There was an issue connecting with the server" });
        })
    }

    handleLogin = values => {
        this.setState({ loading: true})
        fetch("https://api.irscybersec.tk/v1/account/login", {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": values.username,
                "password": values.password,
            })
        }).then((results) => {
            return results.json(); //return data in JSON (since its JSON data)
        }).then((data) => {
            console.log(data)
            if (data.success === true) {
                const login = async () => {
                    await this.props.handleLogin(data.token, data.permissions, values.remember)
                    this.setState({loading: false})
                }

                login()
            }
            else {

                if (data.error === "wrong-username") {
                    message.error({ content: "Oops. Username does not exist" })
                }
                else if (data.error === "wrong-password") {
                    message.error({ content: "Oops. Incorrect password" })
                }
                else {
                    message.error({ content: "Oops. Unknown error" })
                }

            }
        }).catch((error) => {
            message.error({ content: "Oops. There was an issue connecting to the server" });
        })
    }


    onFinish = values => {
        console.log('Received values of form: ', values);
    }

    render() {

        return (

            <Layout style={{ maxWidth: "100vw", maxHeight: "100vh", overflow: "hidden" }}>
                <Content style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", width: "70vw", backgroundImage: "url(" + require("./assets/login_photo.jpg") + ")", backgroundSize: "cover", overflow: `hidden` }}>
                        <div style={{ fontSize: "3.5vw", color: "white" }}>
                            <span style={{ fontWeight: "500", textShadow: '1px -1px 1px -1px #000000' }}> IRS Cybersec CTF Platform</span>
                        </div>
                        <div style={{ color: "white", fontSize: "1.5vw" }}>
                            <p style={{ textShadow: '1px 1px 1px 1px #000000' }}>Reconstructing the wheel from scratch. Because why not?™</p>
                        </div>
                    </div>


                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", width: "30vw", boxShadow: "-5px 0px 20px black" }}>
                        {this.state.login && (
                            <div>
                                <h1 style={{ color: "white", fontSize: "2vw" }}>Sign In <Icon type="unlock" theme="twoTone" /> </h1>
                                <Form
                                    name="normal_login"
                                    className="login-form"
                                    initialValues={{ remember: true }}
                                    onFinish={this.handleLogin}
                                    style={{ width: "25vw" }}
                                >
                                    <Form.Item
                                        name="username"
                                        rules={[{ required: true, message: 'Please enter your username.' }]}
                                    >
                                        <Input allowClear prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                                    </Form.Item>
                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: 'Please enter your password.' }]}
                                    >
                                        <Input
                                            prefix={<LockOutlined className="site-form-item-icon" />}
                                            type="password"
                                            placeholder="Password"
                                            allowClear
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox>Remember me</Checkbox>
                                        </Form.Item>

                                        <a className="login-form-forgot" href="">Forgot password</a>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" className="login-form-button" style={{ marginRight: "1vw" }} loading={this.state.loading}>Log in</Button>
                                        Or <a href="#" onClick={() => { this.setState({ login: false, register: true }) }} >Register now!</a>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                        {this.state.register && (
                            <div>
                                <h1 style={{ color: "white", fontSize: "2vw" }}>Register an Account <Icon type="unlock" theme="twoTone" /> </h1>
                                <Form
                                    name="register_form"
                                    className="register-form"
                                    onFinish={this.handleRegister}
                                    style={{ width: "25vw" }}
                                >
                                    <Form.Item
                                        name="username"
                                        rules={[{ required: true, message: 'Please enter a username' }]}
                                    >
                                        <Input allowClear prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Enter a new username" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        rules={[{ required: true, message: 'Please enter an email' },
                                        {
                                            type: 'email',
                                            message: "Please enter a valid email",
                                        }]}
                                    >
                                        <Input allowClear prefix={<MailOutlined />} placeholder="Enter a new email" />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your password!',
                                            },
                                        ]}
                                        hasFeedback
                                    >
                                        <Input.Password allowClear placeholder="Enter a new password" />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirm"
                                        dependencies={['password']}
                                        hasFeedback
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please confirm your password!',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(rule, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject('Oops, the 2 passwords do not match');
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password allowClear placeholder="Confirm new password" />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button loading={this.state.loading} type="primary" htmlType="submit" className="login-form-button" style={{ marginBottom: "1.5vh" }}>Register</Button>

                                        <p>Already have an account? <a href="#" onClick={() => { this.setState({ login: true, register: false }) }}>Login Here!</a></p>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                    </div>
                </Content>
            </Layout>
        );
    }
}

export default Login;
