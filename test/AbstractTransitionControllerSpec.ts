import { expect } from 'chai';
import DummyTransitionController from './util/DummyTransitionController';
import * as Vue from 'vue';
import IAbstractTransitionComponent from '../src/lib/interface/IAbstractTransitionComponent';
import AbstractTransitionComponent from '../src/lib/mixin/AbstractTransitionComponent';
import AbstractTransitionController from '../src/lib/util/AbstractTransitionController';

describe('AbstractTransitionControllerSpec', () => {
	let dummyTransitionController: DummyTransitionController;
	let dummyChildComponent: any;
	let dummyChildTransitionController: DummyTransitionController;

	beforeEach(function () {
		dummyChildComponent = new Vue({
			name: 'ChildComponent',
			el: document.createElement('div'),
			extends: AbstractTransitionComponent,
			beforeCreate() {
				const self = <any>this;
				self.componentId = 'ChildComponent'
				self.transitionController = dummyChildTransitionController;
			},
		})
		dummyChildTransitionController = new DummyTransitionController(<IAbstractTransitionComponent>dummyChildComponent)
		dummyTransitionController = new DummyTransitionController(<IAbstractTransitionComponent>new Vue({
			name: 'DummyComponent',
			el: document.createElement('div'),
			extends: AbstractTransitionComponent,
			created() {
				this.$children.push(dummyChildComponent)
			}
		}));
	});

	describe('transitioning', () => {
		it('should transitionIn the component', () => {
			return dummyTransitionController.transitionIn()
		});

		it('should not transition out since it\'s already transitioned out', () => {
			return dummyTransitionController.transitionOut()
		});

		it('should transition out the component', () => {
			return dummyTransitionController.transitionIn()
				.then(() => dummyTransitionController.transitionOut())
		});
	});

	describe('getSubTimeline', () => {
		it('should try to get a transition in sub-timeline', () => {
			expect(dummyTransitionController.getSubTimeline('ChildComponent', AbstractTransitionController.IN))
				.to.not.equal(undefined);
		});

		it('should throw an error because that component does not exist', () => {
			expect(() => dummyTransitionController.getSubTimeline('FooComponent', AbstractTransitionController.IN))
				.to.throw(Error);
		});

		it('should try to get a transition out sub-timeline', () => {
			expect(dummyTransitionController.getSubTimeline('ChildComponent', AbstractTransitionController.OUT))
				.to.not.equal(undefined);
		});
	});

	describe('dispose', () => {
		it('should dispose the transition controller and mark it as disposed', () => {
			// Dispose the transition controller
			dummyTransitionController.dispose()
			expect(dummyTransitionController.isDisposed()).to.equal(true);
		});

		it('when it\'s still transitioning out should return a promise and dispose it when it\'s done', (done) => {
			// Trigger transition out
			dummyTransitionController.transitionIn()
				.then(() => {
					dummyTransitionController.transitionOut();

					// Dispose the controller
					dummyTransitionController.dispose();

					expect(dummyTransitionController.isDisposed()).to.equal(true);

					// Mark as done
					done();
				});
		});
	});
});
