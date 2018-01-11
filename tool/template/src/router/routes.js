import { COMPONENT_ID } from 'vue-transition-component';
import HomePage from 'page/HomePage';
import PagePaths from 'data/enum/PagePaths';
import PageNames from 'data/enum/PageNames';

export default [
  {
    path: PagePaths.HOME,
    component: HomePage,
    name: PageNames.HOME,
    props: { [COMPONENT_ID]: PageNames.HOME },
  },
];
