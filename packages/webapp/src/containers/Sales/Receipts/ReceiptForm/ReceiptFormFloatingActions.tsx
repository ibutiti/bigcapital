// @ts-nocheck
import React from 'react';
import {
  Intent,
  Button,
  ButtonGroup,
  Popover,
  PopoverInteractionKind,
  Position,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import { FSelect, Group, FormattedMessage as T } from '@/components';
import { useFormikContext } from 'formik';
import { useHistory } from 'react-router-dom';
import { If, Icon } from '@/components';
import { useReceiptFormContext } from './ReceiptFormProvider';
import { useReceiptFormBrandingTemplatesOptions } from './utils';
import { useDrawerActions } from '@/hooks/state';
import {
  BrandingThemeFormGroup,
  BrandingThemeSelectButton,
} from '@/containers/BrandingTemplates/BrandingTemplatesSelectFields';
import { PageForm } from '@/components/PageForm';
import { MoreIcon } from '@/icons/More';
import { DRAWERS } from '@/constants/drawers';

/**
 * Receipt floating actions bar.
 */
export default function ReceiptFormFloatingActions() {
  // History context.
  const history = useHistory();

  const { openDrawer } = useDrawerActions();

  // Formik context.
  const { resetForm, submitForm, isSubmitting } = useFormikContext();

  // Receipt form context.
  const { receipt, setSubmitPayload } = useReceiptFormContext();

  // Handle submit & close button click.
  const handleSubmitCloseBtnClick = (event) => {
    setSubmitPayload({ redirect: true, status: true });
    submitForm();
  };

  // Handle submit, close & new button click.
  const handleSubmitCloseAndNewBtnClick = (event) => {
    setSubmitPayload({ redirect: false, status: true, resetForm: true });
    submitForm();
  };

  // Handle submit, close & continue editing button click.
  const handleSubmitCloseContinueEditingBtnClick = (event) => {
    setSubmitPayload({ redirect: false, status: true });
    submitForm();
  };

  // Handle submit & draft button click.
  const handleSubmitDraftBtnClick = (event) => {
    setSubmitPayload({ redirect: true, status: false });
    submitForm();
  };

  // Handle submit, draft & new button click.
  const handleSubmitDraftAndNewBtnClick = (event) => {
    setSubmitPayload({ redirect: false, status: false, resetForm: true });
    submitForm();
  };

  const handleSubmitDraftContinueEditingBtnClick = (event) => {
    setSubmitPayload({ redirect: false, status: false });
    submitForm();
  };

  // Handle cancel button click.
  const handleCancelBtnClick = (event) => {
    history.goBack();
  };

  // Handle the clear button click.
  const handleClearBtnClick = (event) => {
    resetForm();
  };

  // Handles the invoice customize button click.
  const handleCustomizeBtnClick = () => {
    openDrawer(DRAWERS.BRANDING_TEMPLATES, { resource: 'SaleReceipt' });
  };

  const brandingTemplatesOptions = useReceiptFormBrandingTemplatesOptions();

  return (
    <PageForm.FooterActions spacing={10} position="apart">
      <Group spacing={10}>
        {/* ----------- Save And Close ----------- */}
        <If condition={!receipt || !receipt?.is_closed}>
          <ButtonGroup>
            <Button
              disabled={isSubmitting}
              loading={isSubmitting}
              intent={Intent.PRIMARY}
              onClick={handleSubmitCloseBtnClick}
              text={<T id={'save_close'} />}
            />
            <Popover
              content={
                <Menu>
                  <MenuItem
                    text={<T id={'close_and_new'} />}
                    onClick={handleSubmitCloseAndNewBtnClick}
                  />
                  <MenuItem
                    text={<T id={'close_continue_editing'} />}
                    onClick={handleSubmitCloseContinueEditingBtnClick}
                  />
                </Menu>
              }
              minimal={true}
              interactionKind={PopoverInteractionKind.CLICK}
              position={Position.BOTTOM_LEFT}
            >
              <Button
                disabled={isSubmitting}
                intent={Intent.PRIMARY}
                rightIcon={<Icon icon="arrow-drop-up-16" iconSize={20} />}
              />
            </Popover>
          </ButtonGroup>
          {/* ----------- Save As Draft ----------- */}
          <ButtonGroup>
            <Button
              disabled={isSubmitting}
              className={'ml1'}
              onClick={handleSubmitDraftBtnClick}
              text={<T id={'save_as_draft'} />}
            />
            <Popover
              content={
                <Menu>
                  <MenuItem
                    text={<T id={'save_and_new'} />}
                    onClick={handleSubmitDraftAndNewBtnClick}
                  />
                  <MenuItem
                    text={<T id={'save_continue_editing'} />}
                    onClick={handleSubmitDraftContinueEditingBtnClick}
                  />
                </Menu>
              }
              minimal={true}
              interactionKind={PopoverInteractionKind.CLICK}
              position={Position.BOTTOM_LEFT}
            >
              <Button
                disabled={isSubmitting}
                rightIcon={<Icon icon="arrow-drop-up-16" iconSize={20} />}
              />
            </Popover>
          </ButtonGroup>
        </If>

        {/* ----------- Save and New ----------- */}
        <If condition={receipt && receipt?.is_closed}>
          <ButtonGroup>
            <Button
              disabled={isSubmitting}
              intent={Intent.PRIMARY}
              onClick={handleSubmitCloseBtnClick}
              style={{ minWidth: '85px' }}
              text={<T id={'save'} />}
            />
            <Popover
              content={
                <Menu>
                  <MenuItem
                    text={<T id={'save_and_new'} />}
                    onClick={handleSubmitCloseAndNewBtnClick}
                  />
                </Menu>
              }
              minimal={true}
              interactionKind={PopoverInteractionKind.CLICK}
              position={Position.BOTTOM_LEFT}
            >
              <Button
                disabled={isSubmitting}
                intent={Intent.PRIMARY}
                rightIcon={<Icon icon="arrow-drop-up-16" iconSize={20} />}
              />
            </Popover>
          </ButtonGroup>
        </If>

        {/* ----------- Clear & Reset----------- */}
        <Button
          className={'ml1'}
          disabled={isSubmitting}
          onClick={handleClearBtnClick}
          text={receipt ? <T id={'reset'} /> : <T id={'clear'} />}
        />
        {/* ----------- Cancel ----------- */}
        <Button
          className={'ml1'}
          onClick={handleCancelBtnClick}
          text={<T id={'cancel'} />}
        />
      </Group>

      <Group spacing={0}>
        {/* ----------- Branding Template Select ----------- */}
        <BrandingThemeFormGroup
          name={'pdf_template_id'}
          label={'Branding'}
          inline
          fastField
          style={{ marginLeft: 20 }}
        >
          <FSelect
            name={'pdf_template_id'}
            items={brandingTemplatesOptions}
            input={({ activeItem, text, label, value }) => (
              <BrandingThemeSelectButton text={text || 'Brand Theme'} minimal />
            )}
            filterable={false}
            popoverProps={{ minimal: true }}
          />
        </BrandingThemeFormGroup>

        {/* ----------- Setting Select ----------- */}
        <Popover
          minimal={true}
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.TOP_RIGHT}
          modifiers={{
            offset: { offset: '0, 4' },
          }}
          content={
            <Menu>
              <MenuItem
                text={'Customize Templates'}
                onClick={handleCustomizeBtnClick}
              />
            </Menu>
          }
        >
          <Button minimal icon={<MoreIcon height={'14px'} width={'14px'} />} />
        </Popover>
      </Group>
    </PageForm.FooterActions>
  );
}
