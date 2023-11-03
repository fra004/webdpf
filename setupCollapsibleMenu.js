/**
 * Created by rabbi on 2/4/15.
 */

$(function() {
    $('#first').collapsible('accordion-open', {
        contentOpen: 0
    });
    $('#second').collapsible('accordion', {
        animate: false
    });
    $('#third').collapsible('accordion');
    $('#fourth').collapsible('default-open');
    $('#fifth').collapsible({
        animate: false
    });
    $('#sixth').collapsible();
});