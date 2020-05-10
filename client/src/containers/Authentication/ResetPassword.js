import React, { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Button,
  InputGroup,
  Intent,
  FormGroup,
  Position,
} from '@blueprintjs/core';
import { Link, useParams, useHistory } from 'react-router-dom';
import ErrorMessage from 'components/ErrorMessage';
import AppToaster from 'components/AppToaster';
import { compose } from 'utils';
import withAuthenticationActions from './withAuthenticationActions';
import AuthInsider from 'containers/Authentication/AuthInsider';
import { FormattedMessage as T, useIntl } from 'react-intl';

function ResetPassword({ requestResetPassword }) {
  const { formatMessage } = useIntl();
  const { token } = useParams();
  const history = useHistory();

  const ValidationSchema = Yup.object().shape({
    password: Yup.string()
      .min(4, 'Password has to be longer than 4 characters!')
      .required('Password is required!'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const initialValues = useMemo(
    () => ({
      password: '',
      confirm_password: '',
    }),
    []
  );

  const {
    touched,
    values,
    errors,
    handleSubmit,
    setFieldValue,
    getFieldProps,
    isSubmitting,
  } = useFormik({
    enableReinitialize: true,
    validationSchema: ValidationSchema,
    initialValues: {
      ...initialValues,
    },
    onSubmit: (values, { setSubmitting }) => {
      requestResetPassword(values, token)
        .then((response) => {
          AppToaster.show({
            message: formatMessage('password_successfully_updated'),
            intent: Intent.DANGER,
            position: Position.BOTTOM,
          });
          history.push('/auth/login');
          setSubmitting(false);
        })
        .catch((errors) => {
          if (errors.find((e) => e.type === 'TOKEN_INVALID')) {
            AppToaster.show({
              message: formatMessage('an_unexpected_error_occurred'),
              intent: Intent.DANGER,
              position: Position.BOTTOM,
            });
            history.push('/auth/login');
          }
          setSubmitting(false);
        });
    },
  });

  return (
    <AuthInsider>
      <div className={'submit-np-form'}>
        <div className={'authentication-page__label-section'}>
          <h3>
            <T id={'choose_a_new_password'} />
          </h3>
          <T id={'you_remembered_your_password'} />{' '}
          <Link to='/auth/login'>
            <T id={'login'} />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <FormGroup
            label={<T id={'password'} />}
            intent={errors.password && touched.password && Intent.DANGER}
            helperText={
              <ErrorMessage name={'password'} {...{ errors, touched }} />
            }
            className={'form-group--password'}
          >
            <InputGroup
              lang={true}
              type={'password'}
              intent={errors.password && touched.password && Intent.DANGER}
              {...getFieldProps('password')}
            />
          </FormGroup>

          <FormGroup
            label={<T id={'new_password'} />}
            labelInfo={'(again):'}
            intent={
              errors.confirm_password &&
              touched.confirm_password &&
              Intent.DANGER
            }
            helperText={
              <ErrorMessage
                name={'confirm_password'}
                {...{ errors, touched }}
              />
            }
            className={'form-group--confirm-password'}
          >
            <InputGroup
              lang={true}
              type={'password'}
              intent={
                errors.confirm_password &&
                touched.confirm_password &&
                Intent.DANGER
              }
              {...getFieldProps('confirm_password')}
            />
          </FormGroup>

          <div className={'authentication-page__submit-button-wrap'}>
            <Button
              fill={true}
              className={'btn-new'}
              intent={Intent.PRIMARY}
              type='submit'
              loading={isSubmitting}
            >
              <T id={'submit_new_password'} />
            </Button>
          </div>
        </form>
      </div>
    </AuthInsider>
  );
}

export default compose(withAuthenticationActions)(ResetPassword);
