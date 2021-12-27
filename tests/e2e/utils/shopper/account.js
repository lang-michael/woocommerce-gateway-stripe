import config from 'config';

import {
	checkUseNewPaymentMethod,
	confirmCardAuthentication,
	fillUpeCard,
} from '../payments';

const baseUrl = config.get( 'url' );

const MY_ACCOUNT_ADD_PAYMENT_METHOD = baseUrl + 'my-account/add-payment-method';
const MY_ACCOUNT_PAYMENT_METHODS = baseUrl + 'my-account/payment-methods';

/**
 * Opens the Add Payment Method page
 */
export async function goToAddPaymentMethodPage() {
	await page.goto( MY_ACCOUNT_ADD_PAYMENT_METHOD, {
		waitUntil: 'networkidle0',
	} );
}

/**
 * Opens the Add Payment Method page
 */
export async function goToPaymentMethodsPage() {
	await page.goto( MY_ACCOUNT_PAYMENT_METHODS, {
		waitUntil: 'networkidle0',
	} );
}

/**
 * Happy path for adding a new payment method in 'My Account > Payment methods' page.
 * It can handle 3DS and 3DS2 flows.
 *
 * @param {*} cardType Card type as defined in the `test.json` file. Examples: `basic`, `3ds2`, `declined`.
 * @param {*} card Card object that you want to add as the new payment method.
 */
export async function addNewPaymentMethod( cardType, card ) {
	await goToAddPaymentMethodPage();
	await checkUseNewPaymentMethod();
	await fillUpeCard( card );

	await expect( page ).toClick( 'button', {
		text: 'Add payment method',
	} );

	const cardIs3DS =
		cardType.toUpperCase().includes( '3DS' ) &&
		! cardType.toLowerCase().includes( 'declined' );

	if ( cardIs3DS ) {
		await confirmCardAuthentication( cardType );
	}

	await page.waitForNavigation( {
		waitUntil: 'networkidle0',
	} );
}

/**
 * Removes all saved cards from account
 */
export async function removedPaymentMethods() {
	await goToPaymentMethodsPage();
	const savedCards = await page.$$( '.payment-method .delete' );

	for ( const card of savedCards ) {
		await card.click();
		await page.waitForNavigation( {
			waitUntil: 'networkidle0',
		} );
		await expect( page ).toMatch( 'Payment method deleted.' );
	}
}
