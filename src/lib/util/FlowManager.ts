import Disposable from 'seng-disposable';
import FlowTypes from '../enum/FlowTypes';
import IAbstractPageTransitionComponent from '../interface/IAbstractPageTransitionComponent';
import { COMPONENT_ID } from '../mixin/AbstractRegistrableComponent';

export class FlowManager extends Disposable {
	/**
	 * @property _transitionOut
	 * @type Promise<void>
	 */
	private _transitionOut: Promise<void>;
	/**
	 * @property _previousComponentId
	 * @type string
	 */
	private _previousComponentId: string;
	/**
	 * @public
	 * @method get transitionOut
	 * @returns {Promise<any>}
	 */
	public get transitionOut(): Promise<void> {
		return this._transitionOut;
	}
	/**
	 * @public
	 * @method start
	 * @param pageInstance
	 * @param flow
	 * @description The vue router triggers the onLeave method twice, so we need to store the current componentId to
	 * avoid weird page transition issues. If it's triggered on the same page we release the hijack right away.
	 * @returns {void}
	 */
	public start(pageInstance: IAbstractPageTransitionComponent, release: () => void): void {
		if (this._previousComponentId === pageInstance[COMPONENT_ID]) {
			release();
		} else {
			this._previousComponentId = pageInstance[COMPONENT_ID];
			switch (pageInstance.flow) {
				case FlowTypes.NORMAL: {
					this._transitionOut = pageInstance.transitionOut();
					this._transitionOut.then(release);
					break;
				}
				case FlowTypes.CROSS: {
					this._transitionOut = pageInstance.transitionOut();
					release();
					break;
				}
				default: {
					throw new Error('[FlowManager] Unknown flow: [' + pageInstance.flow + ']');
				}
			}
		}
	}

	/**
	 * @public
	 * @description Dispose the flow manager
	 */
	public dispose():void {
		this._transitionOut = null;
		this._previousComponentId = null;

		super.dispose();
	}
}

const flowManager = new FlowManager();

export default flowManager;
