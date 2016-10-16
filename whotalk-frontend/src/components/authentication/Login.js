import React, {Component, PropTypes} from 'react';
import {Link, Redirect} from 'react-router';
import {LoginForm} from './forms';
import autobind from 'autobind-decorator';
import { storage } from 'helpers';
import notify from 'helpers/notify'

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            animate: false,
            leave: false,
            path: ''
        };
    }

    @autobind
    handleChange(e) {
        const {FormActions} = this.props;
        FormActions.changeInput({form: 'login', name: e.target.name, value: e.target.value})
    }

    @autobind
    leaveTo({path, express=false}) {
         this.setState({animate: true, path});

         if(express) {
             if(process.env.NODE_ENV==='development') {
                 document.location.href = "http://localhost:4000" + path;
             } else {
                 document.location.href = path;
             }
             return;
         }
        setTimeout(() => this.setState({leave: true}), 700)
    }

    @autobind
    async handleSubmit() {
        const {form, status, FormActions, AuthActions} = this.props;

        const {username, password} = form;

        notify.clear();


        const regex = /^[0-9a-zA-Z]{4,30}$/;

        if(!(regex.test(username) && regex.test(password))) {
            //toastr.error('Please check your username or password');
            notify({type: 'error', message: 'Please check your username or password'});
            return;
        }

        AuthActions.setSubmitStatus({name: 'login', value: true});

        try {
            await AuthActions.localLogin({username, password});
        } catch (e) {
             //toastr.error('Incorrect username or password');
             notify({type: 'error', message: 'Incorrect username or password'});
             AuthActions.setSubmitStatus({name: 'login', value: false});
             return;
        }

        this.leaveTo({path: '/'});
        //toastr.success(`Hello, ${this.props.status.session.user.common_profile.givenName}!`);
        notify({type: 'success', message: `Hello, ${this.props.status.session.user.common_profile.givenName}!`});
        storage.set('session', this.props.status.session);
        
        AuthActions.setSubmitStatus({name: 'login', value: false});
        
    }

    @autobind
    handleKeyPress(e) {
        if (e.charCode === 13) {
            this.handleSubmit();
        }
    }

    render() {

        const redirect = (<Redirect
            to={this.state.path}/>);

        
        const {handleChange, handleSubmit, handleKeyPress, leaveTo} = this;
        const { form, status } = this.props;


        return (
            <div className="login">
                <div
                    className={"box bounceInRight " + (this.state.animate
                    ? 'bounceOutLeft'
                    : '')}>
                    <div className="local">
                        <p className="title">LOG IN WITH YOUR USERNAME</p>
                        <LoginForm 
                            form={form}
                            status={status}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            onKeyPress={handleKeyPress}
                        />
                        <div className="login-footer">
                            <p>New Here?&nbsp;<a onClick={() => this.leaveTo({path: '/auth/register'})}>
                                    Create an account</a>
                            </p>
                            <p>
                                <Link to="/">* Forgot Password?</Link>
                            </p>
                        </div>
                    </div>

                    <div className="or">OR</div>
                    <div className="ui horizontal divider">
                        Or
                    </div>
                    <div className="social">
                        <p className="title">CLICK TO LOG IN WITH</p>
                        <div className="hide-on-mobile">
                            <button className="ui facebook oauth button massive" onClick={()=>leaveTo({path: '/api/authentication/facebook', express: true})}>
                                <i className="facebook icon"></i>
                                Facebook
                            </button>

                            <button className="ui google plus oauth button massive" onClick={()=>leaveTo({path: '/api/authentication/google', express: true})}>
                                <i className="google icon"></i>
                                Google
                            </button>
                        </div>
                        <div className="ui grid hide-on-desktop">
                            <div className="eight wide column">
                                <button className="ui facebook button icon massive" onClick={()=>leaveTo({path: '/api/authentication/facebook', express: true})}>
                                    <i className="facebook icon"></i>
                                </button>
                            </div>
                            <div className="eight wide column">
                                <button className="ui google plus icon button massive" onClick={()=>leaveTo({path: '/api/authentication/google', express: true})}>
                                    <i className="google icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.leave
                    ? redirect
                    : undefined}
            </div>
        );
    }

    componentWillUnmount() {
        this.props.FormActions.formReset();
    }
}

export default Login;