import AbstractVueTransitionController from '../util/AbstractVueTransitionController';
import { IAbstractRegistrableComponent } from './IAbstractRegistrableComponent';

export interface IAbstractTransitionComponent extends IAbstractRegistrableComponent {
  /**
   * @public
   * @property transitionController
   * @description The transition controller for the component
   */
  transitionController: AbstractVueTransitionController;

  /**
   * @public
   * @method transitionIn
   * @description The main transitionIn method for the component
   * @param forceTransition Add this flag if you want to overwrite any active transitions
   * @returns A promise that will be resolved when the transition in timeline is completed
   */
  transitionIn(forceTransition?: boolean): Promise<void>;

  /**
   * @public
   * @method transitionOut
   * @description The main transitionOut method for the component
   * @param forceTransition Add this flag if you want to overwrite any active transitions
   * @returns A promise that will be resolved when the transition in timeline is completed
   */
  transitionOut(forceTransition?: boolean): Promise<void>;
}
