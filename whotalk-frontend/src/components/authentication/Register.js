import React, {Component} from 'react';
import {Link, Redirect} from 'react-router';
import {RegisterForm} from './forms';
import autobind from 'autobind-decorator'
const toastr = window.toastr;

class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            animate: false,
            leave: false,
            path: ''
        };
    }

    @autobind
    leaveTo(path) {
        this.setState({animate: true, path});
        setTimeout(() => this.setState({leave: true}), 700)
    }

    @autobind
    handleRegister() {
        const {form, AuthActions, FormActions} = this.props;
        const {username, password} = form;

        // do username / password regex check
        const regex = {
            username: /^[0-9a-zA-Z]{4,15}$/,
            password: /^[0-9a-zA-Z]{5,30}$/
        }

        let error = false;

        if (!regex.password.test(password)) {
            error = true;
            toastr.error('<b><i>Password</i></b> should be 5 ~ 30 alphanumeric characters.');
            FormActions.setInputError({form: 'register', name: 'password', error: true});
        }

        if (!regex.username.test(username)) {
            error = true;
            toastr.error('<b><i>Username</i></b> should be 4 ~ 14 alphanumeric characters.');
            FormActions.setInputError({form: 'register', name: 'username', error: true});
        }

        // stop at here if there is an error
        if (error) {
            return;
        }

        AuthActions.localRegisterPrior({username, password});
        this.leaveTo('/auth/register/additional');
    }

    @autobind
    handleChange(e) {
        const {FormActions} = this.props;
        FormActions.changeInput({form: 'register', name: e.target.name, value: e.target.value})
    }

    @autobind
    handleBlur(e) {
        const {form, status, AuthActions} = this.props;

        if (e.target.name === 'username') {
            // on username blur, do check username
            AuthActions
                .checkUsername(form.username)
                .then((result) => {
                    if (result.action.payload.data.exists) {
                        toastr.error('That username is already taken, please try another one.<b><i>Username</i></b> al' +
                                'ready');
                    }
                });
        }
    }

    render() {
        const redirect = (<Redirect
            to={{
            pathname: this.state.path,
            state: {
                from: this.props.location
            }
        }}/>);

        const {handleChange, handleRegister, handleBlur} = this;
        const {form, formError, status} = this.props;

        return (
            <div className="register">
                <div
                    className={"box bounceInRight " + (this.state.animate
                    ? 'bounceOutLeft'
                    : '')}>
                    <div className="social">
                        <h2>SIGN UP WITH</h2>
                        <div className="ui grid">
                            <div className="eight wide column">
                                <button
                                    onClick={() => toastr.error('I do not think that word means what you think it means.', 'Inconceivable!')}className="ui facebook button massive hide-on-mobile">
                                    <i className="facebook icon"></i>
                                    Facebook
                                </button>
                                <button className="ui facebook button icon massive hide-on-desktop">
                                    <i className="facebook icon"></i>
                                </button>
                            </div>
                            <div className="eight wide column">
                                <button className="ui google plus button massive hide-on-mobile">
                                    <i className="google icon"></i>
                                    Google
                                </button>
                                <button className="ui google plus icon button massive hide-on-desktop">
                                    <i className="google icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="divider">
                        OR
                    </div>
                    <div className="local">
                        <h2>SIGN UP WITH YOUR USERNAME</h2>
                        <RegisterForm
                            username={form.username}
                            password={form.password}
                            status={status}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onSubmit={handleRegister}
                            error={formError}/>
                        <div className="side-message">Already have an account?&nbsp;
                            <a onClick={() => this.leaveTo("/auth")}>Log In</a>
                        </div>
                    </div>
                </div>
                {this.state.leave
                    ? redirect
                    : undefined}
            </div>
        );
    }
}

export default Register;