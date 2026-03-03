export type RegexTesterTab = 'tester' | 'library';

export type RegexTesterParams = Record<'flags' | 'pattern' | 'replace' | 'replacement' | 'test', string>;

export interface HeaderRow {
	id: string;
	key: string;
	value: string;
}

export type FieldType =
	| 'First Name'
	| 'Last Name'
	| 'Full Name'
	| 'Email'
	| 'Phone'
	| 'Address'
	| 'City'
	| 'Country'
	| 'Company'
	| 'Job Title'
	| 'UUID'
	| 'Date'
	| 'Boolean'
	| 'Integer'
	| 'Float'
	| 'URL'
	| 'IP Address'
	| 'Hex Color'
	| 'Sentence'
	| 'Paragraph';

export interface FieldSchema {
	id: string;
	name: string;
	type: FieldType;
	min?: number;
	max?: number;
}
