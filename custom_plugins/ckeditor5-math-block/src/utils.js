

export function isMathBlock( modelElement ) {
	return !!modelElement && modelElement.is( 'mathBlock' );
}
export function isMathEquation( modelElement ) {
	return !!modelElement && modelElement.is( 'equation' );
}
