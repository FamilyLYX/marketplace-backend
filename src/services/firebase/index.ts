import { App, AppOptions, initializeApp } from 'firebase-admin/app';
import { CollectionReference, Firestore, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDocs, query, setDoc, where } from 'firebase/firestore';
import { credential } from 'firebase-admin';

class Firebase {
	#firebaseConfig: AppOptions;
	app: App;
	db: Firestore;

	constructor(firebaseConfig: AppOptions) {
		// Your web app's Firebase configuration
		this.#firebaseConfig = firebaseConfig;

		// Initialize Firebase
		this.app = initializeApp(firebaseConfig);
		this.db = getFirestore(this.app);
	}

	async authenticateUserFromToken(token: string) {
		const decodedToken = await getAuth().verifyIdToken(token);

		return decodedToken.uid;
	}

	async getStripeAccountId(uid: string) {
		const stripeRef = this.db.collection('stripe/accounts');

		const q = query(stripeRef as any, where('uid', '==', uid));

		const querySnapshot = await getDocs(q);

		if (querySnapshot.size === 0) throw new Error('NO STRIPE ACCOUNT ID');

		return (querySnapshot.docs[0] as any).stripeAccountId;
	}

	async saveStripeAccountIdToDb(uid: string, stripeAccountId: string) {
		const stripeRef = this.db.collection('stripe/accounts');

		await setDoc(stripeRef as any, {
			uid,
			stripeAccountId,
		});
	}

	async createCheckoutSession(lsp8Addess: string, sellerId: string, checkoutId: string, buyer: string, lsp8Id: number) {
		const stripeRef = this.db.collection('stripe/checkout');

		await setDoc(stripeRef as any, {
			lsp8Addess,
			sellerId,
			checkoutId,
			buyer,
			lsp8Id,
		});
	}

	async getCheckoutDetails(checkoutId: string) {
		const stripeRef = this.db.collection('stripe/checkout');

		const q = query(stripeRef as any, where('checkoutId', '==', checkoutId));

		const querySnapshot = await getDocs(q);

		if (querySnapshot.size === 0) throw new Error('ERR: CHECKOUT NOT FOUND');

		type Checkout = {
			lsp8Addess: string;
			sellerId: string;
			checkoutId: string;
			buyer: string;
			lsp8Id: number;
		};

		const data: Checkout[] = [];

		querySnapshot.forEach((res) => data.push(res as unknown as Checkout));

		return data;
	}
}

export const firebase = new Firebase({
	credential: credential.cert('./firebase-cred.json'),
});
