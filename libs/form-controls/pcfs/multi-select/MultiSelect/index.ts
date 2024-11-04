import { StrictMode, createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IMultiSelectProps, MultiSelect as MS } from '../../../ui/src/index';
import { IInputs, IOutputs } from './generated/ManifestTypes';
import { IMultiSelectMetadata, ISelectableOption } from './interfaces';
import {
  createSelections,
  getMetadata,
  getOptions,
  getSelectedValues,
  removeSelections,
} from './api';

export class MultiSelect
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  /**
   * The react Root object responsible for rendering the React component from.
   */
  private root!: Root;
  /**
   * List of selectable options.
   */
  private options!: ISelectableOption[];
  /**
   * List of selected options.
   */
  private selections!: ISelectableOption[];
  /**
   * The filter string used to filter options.
   */
  private filter!: string;
  /**
   * An object containing the props necessary to render the React component.
   */
  private props!: IMultiSelectProps<ISelectableOption>;
  /**
   * An object containing all the column and table metadata required for API calls.
   */
  private metadata!: IMultiSelectMetadata;
  /**
   * A lock variable to prevent fetching metadata in concurrent updateView calls.
   */
  private lockGetMetaData!: boolean;
  /**
   * The organization URL.
   */
  private orgUrl!: string;
  /**
   * A boolean to let the control know to reload options in the next call of updateView.
   */
  private requireLoadOptions!: boolean;
  /**
   * A boolean to let the control know to reload selections in the next call of updateView.
   */
  private requireLoadSelections!: boolean;
  /**
   * A boolean to let tell the control whether the initial load is complete.
   */
  private initalLoadCompleted!: boolean;
  /**
   * The ID of the Primary entity.
   */
  private primaryEntityId!: string | null;
  /**
   * A list of selections to save that accumulates values when there is not yet a primary ID.
   */
  private selectionQueue!: ISelectableOption[];

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // @ts-ignore
    const { page } = context;

    this.orgUrl = page.getClientUrl();
    this.root = createRoot(container);
    this.lockGetMetaData = false;
    this.requireLoadOptions = true;
    this.requireLoadSelections = false;
    this.initalLoadCompleted = false;
    this.options = [];
    this.selections = [];
    this.filter = '';
    this.selectionQueue = [];
    this.props = {
      onSelectOption: async (
        updatedSelections: ISelectableOption[],
        selectedValue: ISelectableOption
      ) => {
        this.selections = updatedSelections;
        context.updatedProperties = [];
        this.updateView(context);

        if (this.primaryEntityId) {
          const selected = await createSelections(
            this.orgUrl,
            this.metadata,
            this.primaryEntityId,
            [selectedValue]
          );

          this.options?.forEach((o) => {
            const s = selected.find(
              (so) => so.targetEntityId === o.targetEntityId
            );

            if (s) {
              o.id = s.id;
            }
          });
        } else {
          this.selectionQueue = updatedSelections;
        }
      },
      onRemoveSelection: async (
        updatedSelections: ISelectableOption[],
        removedValue: ISelectableOption
      ) => {
        this.selections = updatedSelections;
        context.updatedProperties = [];
        this.updateView(context);

        if (this.primaryEntityId) {
          const removed = await removeSelections(this.orgUrl, this.metadata, [
            removedValue,
          ]);

          this.options?.forEach((o) => {
            const r = removed.find(
              (ro) => ro.targetEntityId === o.targetEntityId
            );

            if (r) {
              o.id = '';
            }
          });
        } else {
          this.selectionQueue = updatedSelections;
        }
      },
      onClearSelections: async (
        updatedSelections: ISelectableOption[],
        removedSelections: ISelectableOption[]
      ) => {
        this.selections = updatedSelections;
        context.updatedProperties = [];
        this.updateView(context);

        if (this.primaryEntityId) {
          const removed = await removeSelections(
            this.orgUrl,
            this.metadata,
            removedSelections
          );

          this.options?.forEach((o) => {
            const r = removed.find(
              (ro) => ro.targetEntityId === o.targetEntityId
            );

            if (r) {
              o.id = r.id;
            }
          });
        } else {
          this.selectionQueue = updatedSelections;
        }
      },
    };
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public async updateView(
    context: ComponentFramework.Context<IInputs>
  ): Promise<void> {
    const { mode, parameters, updatedProperties } = context,
      { isControlDisabled, isVisible } = mode,
      {
        anchor,
        primaryEntityId,
        primaryRelationshipName,
        targetRelationshipName,
        filter,
        clearSelectionOnFilterUpdate,
        label,
        placeholder,
        tagLimit,
        selectionLimit,
        disableCloseOnSelect,
        disableClearable,
      } = parameters;

    this.requireLoadSelections = this.primaryEntityId !== primaryEntityId?.raw;
    this.primaryEntityId = primaryEntityId?.raw;

    if (
      updatedProperties.indexOf('entityId') !== -1 &&
      this.selectionQueue.length
    ) {
      await this.createQueuedSelections();
    }

    // @ts-ignore
    if (!this.metadata && !this.lockGetMetaData && !anchor.isPropertyLoading) {
      this.filter = filter?.raw ?? '';
      this.lockGetMetaData = true;
      this.metadata = await getMetadata(
        this.orgUrl,
        primaryRelationshipName?.raw!,
        targetRelationshipName?.raw!
      );
      this.lockGetMetaData = false;
    }

    if (
      this.metadata &&
      (this.requireLoadSelections || !this.initalLoadCompleted) &&
      // @ts-ignore
      !anchor.isPropertyLoading
    ) {
      this.requireLoadOptions = false;
      this.initalLoadCompleted = true;

      await this.reloadOptions(this.primaryEntityId, filter?.raw, false);

      if (this.primaryEntityId) {
        await this.loadSelectedValues(this.primaryEntityId);
      } else {
        this.selections = [];
      }
    } else if (
      // @ts-ignore
      !anchor.isPropertyLoading &&
      this.metadata &&
      updatedProperties.indexOf('entityId') === -1 &&
      (this.requireLoadOptions || (filter?.raw as string) !== this.filter)
    ) {
      this.requireLoadOptions = false;
      this.filter = filter?.raw ?? '';

      await this.reloadOptions(
        this.primaryEntityId,
        filter?.raw,
        clearSelectionOnFilterUpdate?.raw || false
      );
    }

    this.props = {
      ...this.props,
      options: this.options,
      selections: this.selections,
      disabled: isControlDisabled,
      visible: isVisible,
      label: label?.raw || '',
      placeholder: placeholder?.raw ?? '',
      optionKey: 'text',
      tagLimit: tagLimit?.raw ?? -1,
      selectionLimit: selectionLimit?.raw ?? -1,
      disableCloseOnSelect: disableCloseOnSelect?.raw || false,
      disableClearable: disableClearable?.raw || false,
    };

    this.root.render(
      createElement(
        StrictMode,
        null,
        createElement(MS, this.props as IMultiSelectProps<unknown>)
      )
    );
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    this.root.unmount();
  }

  private async createQueuedSelections() {
    const selected = await createSelections(
      this.orgUrl,
      this.metadata,
      this.primaryEntityId!,
      this.selectionQueue
    );

    this.selectionQueue = [];
    this.options?.forEach((o) => {
      const s = selected.find((so) => so.targetEntityId === o.targetEntityId);

      if (s) {
        o.id = s.id;
      }
    });
  }

  private async reloadOptions(
    primaryEntityId: string | null,
    filter: string | null,
    clearSelections: boolean
  ) {
    if (clearSelections && this.selections?.length && filter) {
      if (primaryEntityId)
        await removeSelections(this.orgUrl, this.metadata, this.selections);

      this.selections = [];
    }
    this.options = await getOptions(this.orgUrl, this.metadata, filter || '');
  }

  private async loadSelectedValues(primaryEntityId: string) {
    const selections = await getSelectedValues(
      this.orgUrl,
      this.metadata,
      primaryEntityId
    );

    this.selections =
      this.options?.filter((o) =>
        selections.some((s) => s.targetEntityId === o.targetEntityId)
      ) || [];
    this.selections?.forEach((o) => {
      o.id = selections.find((s) => s.targetEntityId === o.targetEntityId)!.id;
    });
  }
}
