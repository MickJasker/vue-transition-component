/* eslint-disable import/no-unresolved */
import AbstractRegistrableComponent from './AbstractRegistrableComponent';
import ComponentType from '../enum/ComponentType.ts';

export default {
  name: 'AbstractTransitionComponent',
  extends: AbstractRegistrableComponent,
  beforeCreate() {
    this.componentType = ComponentType.TRANSITION_COMPONENT;
    this.transitionController = null;
  },
  methods: {
    /**
     * @public
     * @method transitionIn
     * @description The main transitionIn method for the component
     * @param { boolean } forceTransition
     * @returns {Promise<any>}
     */
    transitionIn(forceTransition) {
      return this.allComponentsReady.then(() =>
        this.transitionController.transitionIn(forceTransition),
      );
    },
    /**
     * @public
     * @method transitionOut
     * @description The main transitionOut method for the component
     * @param { boolean } forceTransition
     * @returns {Promise<any>}
     */
    transitionOut(forceTransition) {
      return this.transitionController.transitionOut(forceTransition);
    },
  },
  beforeDestroy() {
    if (this.transitionController) {
      this.transitionController.dispose();
      this.transitionController = null;
    }
  },
};
