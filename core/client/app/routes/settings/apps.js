import AuthenticatedRoute from 'ghost/routes/authenticated';
import CurrentUserSettings from 'ghost/mixins/current-user-settings';
import styleBody from 'ghost/mixins/style-body';

export default AuthenticatedRoute.extend(styleBody, CurrentUserSettings, {
    titleToken: 'Settings - Apps',

    classNames: ['settings-view-apps'],
    //
    // model() {
    //     return this.store.query('setting', {type: 'blog,theme,private'}).then((records) => {
    //         return records.get('firstObject');
    //     });
    // },
    //
    // actions: {
    //     save() {
    //         this.get('controller').send('save');
    //     }
    // }
});
