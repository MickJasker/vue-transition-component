import { TimelineLite, TweenLite, Tween, Animation } from 'gsap';
import { Promise } from 'es6-promise';
import EventDispatcher from 'seng-event';
import IAbstractTransitionComponent from '../interface/IAbstractTransitionComponent';
import TransitionEvent from '../event/TransitionEvent';
import ComponentType from '../enum/ComponentType';
import { COMPONENT_ID } from '../mixin/AbstractRegistrableComponent';

/**
 * @class AbstractTransitionController
 * @description This class is used by all components that you want to be transition in/out
 *
 * When extending the AbstractTransitionController a transition out timeline is not required. If it's not provided it
 * will reverse the transition in timeline when transition out is triggered.
 */
abstract class AbstractTransitionController extends EventDispatcher {
	public static IN: string = 'AbstractTransitionController.IN';
	public static OUT: string = 'AbstractTransitionController.OUT';
	protected static FORWARD: string = 'AbstractTransitionController.FORWARD';
	protected static REVERSED: string = 'AbstractTransitionController.REVERSED';
	/**
	 * @type { IAbstractTransitionComponent }
	 * @protected
	 * @description The viewModel is typed as 'any' because we modify the original Vue instance
	 */
	protected viewModel: IAbstractTransitionComponent;
	/**
	 * @property transitionInTimeline { TimelineLite }
	 * @protected
	 * @description The timeline that is used for transition in animations.
	 */
	protected transitionInTimeline: TimelineLite = new TimelineLite({
		paused: true,
		onUpdate: this.checkDirection.bind(this),
		onStart: () => {
			// Notify about the transition in start
			this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_IN_START));
			// Element is no longer visible
			this._isHidden = false;
		},
		onComplete: this.handleTransitionComplete.bind(
			this,
			AbstractTransitionController.IN,
			AbstractTransitionController.FORWARD,
		),
		onReverseComplete: this.handleTransitionComplete.bind(
			this,
			AbstractTransitionController.OUT,
			AbstractTransitionController.REVERSED,
		),
	});
	/**
	 * @property transitionOutTimeline { TimelineLite }
	 * @protected
	 * @description The timeline that is used for transition out animations. If no animations are added it will
	 * automatically use the reversed version of the transition in timeline for the out animations
	 */
	protected transitionOutTimeline: TimelineLite = new TimelineLite({
		paused: true,
		onStart: () => {
			// Notify about the transition out start
			this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_OUT_START));
			// Element is no longer hidden
			this._isHidden = true;
		},
		onComplete: this.handleTransitionComplete.bind(
			this,
			AbstractTransitionController.OUT,
			AbstractTransitionController.FORWARD,
		),
	});
	/**
	 * @type {boolean}
	 * @private
	 * @description Check if the component is currently in the transitionedOut state, this is to avoid calling the
	 * transition out method when it's already transitioned out.
	 */
	public _isHidden: boolean = true;
	/**
	 * @private
	 * @property _transitionInResolveMethod
	 * @type { ()=>void }
	 * @description The resolve method used for resolving the transition in promise.
	 */
	private _transitionInResolveMethod: () => void;
	/**
	 * @private
	 * @property _transitionOutResolveMethod
	 * @type { ()=>void }
	 * @description The resolve method used for resolving the transition out promise.
	 */
	private _transitionOutResolveMethod: () => void;
	/**
	 * @private
	 * @property _transitionInPromise
	 * @type { Promise<void> }
	 * @description The transition promise is used so we can wait for the transition in to be completed.
	 */
	private _transitionInPromise: Promise<void> = null;
	/**
	 * @private
	 * @property _transitionOutPromise
	 * @type { Promise<void> }
	 * @description The transition promise is used so we can wait for the transition out to be completed.
	 */
	private _transitionOutPromise: Promise<void> = null;
	/**
	 * @private
	 * @description When set to true it will show logs!
	 * @type {boolean}
	 */
	private _debug: boolean = false;
	/**
	 * @private
	 * @property _lastTime
	 * @type {number}
	 * @description Since GreenSock does not trigger a on reverse start event we use this to figure out that the
	 * timeline has been reversed
	 */
	private _lastTime: number = 0;
	/**
	 * @private
	 * @property _forward
	 * @type { boolean }
	 * @description Since GreenSock does not trigger a on reverse start event we use this to figure out that the
	 * timeline has been reversed
	 */
	private _forward: boolean = true;

	constructor(viewModel: IAbstractTransitionComponent, debug: boolean = false) {
		super();
		this.viewModel = viewModel;
		this._debug = debug;
		this.init();
	}

	/**
	 * @public
	 * @method transitionIn
	 * @param { boolean } forceTransition
	 * @returns { Promise<any> }
	 */
	public transitionIn(forceTransition:boolean = false): Promise<void> {
		let oldTransitionPromise = Promise.resolve();

		/**
		 * Check if we already have a transition out going on, if so we finish it right away! and trigger a
		 * transition complete.
		 */
		if (this._transitionOutPromise) {
			if (forceTransition) {
				if(this.transitionOutTimeline.getChildren().length > 0) {
					this.transitionOutTimeline.kill();
				}else {
					this.transitionInTimeline.kill();
				}
				this.handleTransitionComplete(AbstractTransitionController.OUT);

				if (this._debug) {
					console.info(this.viewModel[COMPONENT_ID] + ': Interrupted the transition out!');
				}
			}
			else {
				oldTransitionPromise = this._transitionOutPromise;
			}
		}

		return oldTransitionPromise.then(() => {

			// Make sure the transitionOut is paused in case we clicked the transitionIn while
			// the transitionOut was not finished yet.
			this.transitionOutTimeline.paused(true);

			// Only allow the transition in if the element is hidden
			if (this._transitionInPromise === null && this._isHidden) {
				this._transitionInPromise = new Promise<void>((resolve: () => void) => {
					if (this.transitionInTimeline.getChildren().length === 0) {
						if (this._debug) {
							console.info(this.viewModel[COMPONENT_ID] + ': This block has no transition in timeline');
						}

						// Dispatch the events even though there is no time line
						this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_IN_START));
						this._isHidden = false;
						this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_IN_COMPLETE));

						resolve();
					} else {
						// Remove the paused state from transitionIn Timeline
						this.transitionInTimeline.paused(false);

						this._transitionInResolveMethod = resolve;
						this.transitionInTimeline.restart();
					}
				});
			}

			if (this._transitionInPromise === null) {
				if (this._debug) {
					console.warn('[AbstractTransitionController] Transition in was triggered when the it\'s already' +
						' visible');
				}
				return Promise.resolve();
			}

			return this._transitionInPromise;
		});
	}

	/**
	 * @public
	 * @method transitionOut
	 * @oaran { boolean } forceTransition
	 * @returns {Promise<any>}
	 */
	public transitionOut(forceTransition:boolean = false): Promise<void> {
		let oldTransitionPromise = Promise.resolve();

		/**
		 * Check if we already have a transition out going on, if so we finish it right away! and trigger a
		 * transition complete.
		 */
		if (this._transitionInPromise) {
			if (forceTransition) {
				this.transitionInTimeline.kill();
				this.handleTransitionComplete(AbstractTransitionController.IN);

				if (this._debug) {
					console.warn(this.viewModel[COMPONENT_ID] + ': Interrupted the transition in!');
				}
			}
			else {
				oldTransitionPromise = this._transitionInPromise;
			}
		}

		return oldTransitionPromise.then(() => {
			// Only allow the transition out if the element is not hidden
			if (this._transitionOutPromise === null && !this._isHidden) {
				this._isHidden = true;

				// If we do have a transitionOut make sure the transitionIn is paused in case we clicked the
				// transitionOut while the transitionIn was not finished yet.
				if (this.transitionOutTimeline.getChildren().length > 0) {
					this.transitionOutTimeline.paused(false);
					this.transitionInTimeline.paused(true);
				} else {
					// We don't have a transitionOutTimeline, so we are reversing it, therefore removing the paused state.
					this.transitionInTimeline.paused(false);
				}

				this._transitionOutPromise = new Promise<void>((resolve: () => void) => {
					this._transitionOutResolveMethod = resolve;
					if (this.transitionOutTimeline.getChildren().length > 0) {
						this.transitionOutTimeline.restart();
					} else {
						this.transitionInTimeline.reverse();
					}
				});
			}

			if (!this._transitionOutPromise) {
				if (this._debug) {
					console.warn('[AbstractTransitionController] Transition out was triggered when the it\'s already' +
						' hidden');
				}

				// Already hidden, so resolve it right away
				return Promise.resolve();
			}

			return this._transitionOutPromise;
		});
	}

	/**
	 * @public
	 * @method getSubTimeline
	 * @description When nesting transition components you might want to nest the timelines as well, this makes it
	 * easier to time all the component transitions
	 * @param id
	 * @param direction
	 * @returns { Animation }
	 */
	public getSubTimeline(id: string, direction: string = AbstractTransitionController.IN): Animation {
		const childComponent = <IAbstractTransitionComponent>this.viewModel.getChild(id, ComponentType.TRANSITION_COMPONENT);

		if (!childComponent) {
			throw new Error('No child component for id: [' + id + ']');
		}

		if (!childComponent.transitionController) {
			throw new Error('Child component does not have a transition controller: [' + id + ']');
		}

		const transitionInTimeline = childComponent.transitionController.transitionInTimeline;
		const transitionOutTimeline = childComponent.transitionController.transitionOutTimeline;

		switch (direction) {
			case AbstractTransitionController.IN: {
				return transitionInTimeline.restart();
			}
			case AbstractTransitionController.OUT: {
				if (transitionOutTimeline.getChildren().length > 0) {
					return transitionOutTimeline.restart();
				}

				throw new Error('[AbstractTransitionController.ts] No transition out timeline was created, unable to ' +
					'add the transition in timeline to the transition out timeline. To fix this define a custom ' +
					'transition out timeline for this component');
			}
			default: {
				throw new Error('[AbstractTransitionController] Unsupported direction' + direction);
			}
		}
	}

	/**
	 * @public
	 * @method getSubTimelineDuration
	 * @param id
	 * @param direction
	 * @returns {Animation}
	 */
	public getSubTimelineDuration(id: string, direction: string = AbstractTransitionController.IN): number {
		const childComponent = <IAbstractTransitionComponent>this.viewModel.getChild(id, ComponentType.TRANSITION_COMPONENT);
		const transitionInTimeline = childComponent.transitionController.transitionInTimeline;
		const transitionOutTimeline = childComponent.transitionController.transitionOutTimeline;

		if (!childComponent) {
			throw new Error('No child component for id: [' + id + ']');
		}

		switch (direction) {
			case AbstractTransitionController.IN: {
				return transitionInTimeline.duration();
			}
			case AbstractTransitionController.OUT: {
				if (transitionOutTimeline.getChildren().length > 0) {
					return transitionOutTimeline.duration();
				}

				throw new Error('[AbstractTransitionController.ts] No transition out timeline was created, unable to ' +
					'add the transition in timeline to the transition out timeline. To fix this define a custom ' +
					'transition out timeline for this component');
			}
			default: {
				throw new Error('[AbstractTransitionController] Unsupported direction' + direction);
			}
		}
	}

	/**
	 * @protected
	 * @method init
	 * @description This method will be used for setting up the timelines for the component
	 */
	protected init(): void {
		this.setupTransitionInTimeline();
		this.setupTransitionOutTimeline();
	}

	/**
	 * @public
	 * @method setupTransitionOutTimeline
	 * @description overwrite this method in the parent class
	 */
	protected abstract setupTransitionOutTimeline(): void;

	/**
	 * @public
	 * @method setupTransitionInTimeline
	 * @description overwrite this method in the parent class
	 * */
	protected abstract setupTransitionInTimeline(): void;

	/**
	 * @protected
	 * @method killAndClearTimeline
	 * @param timeline
	 */
	protected killAndClearTimeline(timeline: TimelineLite): void {
		this.clearTimeline(timeline);
		timeline.kill();
	}

	/**
	 * @protected
	 * @method clearTimeline
	 * @param timeline
	 */
	protected clearTimeline(timeline: TimelineLite): void {
		timeline.getChildren().forEach((target) => {
			if ((<Tween>target).target) {
				TweenLite.set((<Tween>target).target, { clearProps: 'all' });
			} else {
				this.clearTimeline(<TimelineLite>target);
			}
		});
		timeline.clear();
	}

	/**
	 * @private
	 * @method handleTransitionComplete
	 * @param { string } type
	 * @param { string } direction
	 */
	private handleTransitionComplete(type: string, direction?: string): void {
		switch (type) {
			case AbstractTransitionController.IN:
				this._transitionInPromise = null;
				if (this._transitionInResolveMethod) {
					this._transitionInResolveMethod();
					this._transitionInResolveMethod = null;
				}
				this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_IN_COMPLETE));
				break;
			case AbstractTransitionController.OUT: {
				this._transitionOutPromise = null;
				if (this._transitionOutResolveMethod) {
					this._transitionOutResolveMethod();
					this._transitionOutResolveMethod = null;
				}
				this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_OUT_COMPLETE));
				break;
			}

		}
	}

	/**
	 * @private
	 * @method clean
	 * @description Clean all the timelines and the resolve method
	 */
	private clean(): void {
		this.viewModel = null;
		this._isHidden = null;

		if (this.transitionOutTimeline) {
			this.killAndClearTimeline(this.transitionOutTimeline);
			this.transitionOutTimeline = null;
		}

		if (this.transitionInTimeline) {
			this.killAndClearTimeline(this.transitionInTimeline);
			this.transitionInTimeline = null;
		}

		this._transitionOutResolveMethod = null;
		this._transitionInResolveMethod = null;

		this._transitionOutPromise = null;
		this._transitionInPromise = null;
	}

	/**
	 * @private
	 * @method checkDirection
	 * @description GreenSock does not support onReverseStart on a timeline therefore we have this little method
	 * chat checks for the direction and if ti's changed we handle it as if it's a reverse start§
	 * @returns {void}
	 */
	private checkDirection(): void {
		const newTime = this.transitionInTimeline.time();
		if ((this._forward && newTime < this._lastTime) || (!this._forward && newTime > this._lastTime)) {
			this._forward = !this._forward;
			if (!this._forward) {
				// Notify about the transition in start
				this.dispatchEvent(new TransitionEvent(TransitionEvent.TRANSITION_OUT_START));
				// Element is no longer visible
				this._isHidden = true;
			}
		}
		this._lastTime = newTime;
	}

	/**
	 * @public
	 * @method destruct
	 * @description Because Vue destructs the VM instance before it removes the DOM node we want to finish the
	 * transition out before actually cleaning everything
	 */
	public dispose(): void {
		if (this._transitionOutPromise && this._transitionOutResolveMethod) {
			this._transitionOutPromise.then(this.clean.bind(this));
		} else {
			this.clean();
		}
		super.dispose();
	}
}

export default AbstractTransitionController;
