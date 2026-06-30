import { useEffect, useState } from 'react'

function getHoursLeftToMidnight() {
	const now = new Date()

	const midnight = new Date()
	midnight.setHours(24, 0, 0, 0)

	const msLeft = midnight.getTime() - now.getTime()
	return Math.ceil(msLeft / (1000 * 60 * 60))
}

function Timer() {
	const [hoursLeft, setHoursLeft] = useState(0)
	useEffect(() => {
		setHoursLeft(getHoursLeftToMidnight())
		console.log(getHoursLeftToMidnight())
	}, [])

	return (
		<svg width='1045' height='1045' viewBox='0 0 1045 1045' fill='none' xmlns='http://www.w3.org/2000/svg'>
			<defs>
				<filter id='clockGlow' x='-50%' y='-50%' width='200%' height='200%'>
					<feGaussianBlur in='SourceGraphic' stdDeviation='2' result='blur1' />
					<feFlood floodColor='#eef2f6' result='color1' />
					<feComposite in='color1' in2='blur1' operator='in' result='glow1' />

					<feGaussianBlur in='SourceGraphic' stdDeviation='6' result='blur2' />
					<feFlood floodColor='#c0e8ff' result='color2' />
					<feComposite in='color2' in2='blur2' operator='in' result='glow2' />

					<feGaussianBlur in='SourceGraphic' stdDeviation='13' result='blur3' />
					<feFlood floodColor='#7ec8f8' result='color3' />
					<feComposite in='color3' in2='blur3' operator='in' result='glow3' />

					<feGaussianBlur in='SourceGraphic' stdDeviation='26' result='blur4' />
					<feFlood floodColor='#3fa9f5' result='color4' />
					<feComposite in='color4' in2='blur4' operator='in' result='glow4' />

					<feMerge>
						<feMergeNode in='glow4' />
						{/* <feMergeNode in='glow3' />
						<feMergeNode in='glow2' />
						<feMergeNode in='glow1' /> */}
						<feMergeNode in='SourceGraphic' />
					</feMerge>
				</filter>
			</defs>

			<g filter='url(#clockGlow)'>
				<rect x='549.301' y='987.3' width='54' height='124' rx='15' transform='rotate(180 549.301 987.3)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='506.301' y='877.3' width='32' height='96' style={{ opacity: hoursLeft >= 1 ? 1 : 0 }} rx='10' fill='#EEF2F6' />
				<rect x='668.73' y='964.467' width='54' height='124' rx='15' transform='rotate(165 668.73 964.467)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='598.727' y='869.344' width='32' height='96' style={{ opacity: hoursLeft >= 2 ? 1 : 0 }} rx='10' transform='rotate(-15 598.727 869.344)' fill='#EEF2F6' />
				<rect x='778.183' y='911.502' width='54' height='124' rx='15' transform='rotate(150 778.183 911.502)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='685.945' y='837.739' width='32' height='96' style={{ opacity: hoursLeft >= 3 ? 1 : 0 }} rx='10' transform='rotate(-30 685.945 837.739)' fill='#EEF2F6' />
				<rect x='870.197' y='832.012' width='54' height='124' rx='15' transform='rotate(135 870.197 832.012)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='762.01' y='784.636' width='32' height='96' style={{ opacity: hoursLeft >= 4 ? 1 : 0 }} rx='10' transform='rotate(-45 762.01 784.636)' fill='#EEF2F6' />
				<rect x='938.503' y='731.417' width='54' height='124' rx='15' transform='rotate(120 938.503 731.417)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='821.74' y='713.657' width='32' height='96' style={{ opacity: hoursLeft >= 5 ? 1 : 0 }} rx='10' transform='rotate(-60 821.74 713.657)' fill='#EEF2F6' />
				<rect x='978.443' y='616.571' width='54' height='124' rx='15' transform='rotate(105 978.443 616.571)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='861.062' y='629.635' width='32' height='96' style={{ opacity: hoursLeft >= 6 ? 1 : 0 }} rx='10' transform='rotate(-75 861.062 629.635)' fill='#EEF2F6' />
				<rect x='987.301' y='495.3' width='54' height='124' rx='15' transform='rotate(90 987.301 495.3)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='877.301' y='538.3' width='32' height='96' style={{ opacity: hoursLeft >= 7 ? 1 : 0 }} rx='10' transform='rotate(-90 877.301 538.3)' fill='#EEF2F6' />
				<rect x='964.469' y='375.87' width='54' height='124' rx='15' transform='rotate(75 964.469 375.87)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='869.346' y='445.874' width='32' height='96' style={{ opacity: hoursLeft >= 8 ? 1 : 0 }} rx='10' transform='rotate(-105 869.346 445.874)' fill='#EEF2F6' />
				<rect x='911.503' y='266.417' width='54' height='124' rx='15' transform='rotate(60 911.503 266.417)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='837.74' y='358.657' width='32' height='96' style={{ opacity: hoursLeft >= 9 ? 1 : 0 }} rx='10' transform='rotate(-120 837.74 358.657)' fill='#EEF2F6' />
				<rect x='832.014' y='174.403' width='54' height='124' rx='15' transform='rotate(45 832.014 174.403)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='784.637' y='282.591' width='32' height='96' style={{ opacity: hoursLeft >= 10 ? 1 : 0 }} rx='10' transform='rotate(-135 784.637 282.591)' fill='#EEF2F6' />
				<rect x='731.418' y='106.098' width='54' height='124' rx='15' transform='rotate(30 731.418 106.098)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='713.656' y='222.86' width='32' height='96' style={{ opacity: hoursLeft >= 11 ? 1 : 0 }} rx='10' transform='rotate(-150 713.656 222.86)' fill='#EEF2F6' />
				<rect x='616.572' y='66.1557' width='54' height='124' rx='15' transform='rotate(15 616.572 66.1557)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='629.637' y='183.537' width='32' height='96' style={{ opacity: hoursLeft >= 12 ? 1 : 0 }} rx='10' transform='rotate(-165 629.637 183.537)' fill='#EEF2F6' />
				<rect x='495.301' y='57.2998' width='54' height='124' rx='15' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='538.301' y='167.3' width='32' height='96' style={{ opacity: hoursLeft >= 13 ? 1 : 0 }} rx='10' transform='rotate(-180 538.301 167.3)' fill='#EEF2F6' />
				<rect x='375.872' y='80.133' width='54' height='124' rx='15' transform='rotate(-15 375.872 80.133)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='445.875' y='175.256' width='32' height='96' style={{ opacity: hoursLeft >= 14 ? 1 : 0 }} rx='10' transform='rotate(165 445.875 175.256)' fill='#EEF2F6' />
				<rect x='266.418' y='133.098' width='54' height='124' rx='15' transform='rotate(-30 266.418 133.098)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='358.656' y='206.86' width='32' height='96' style={{ opacity: hoursLeft >= 15 ? 1 : 0 }} rx='10' transform='rotate(150 358.656 206.86)' fill='#EEF2F6' />
				<rect x='174.405' y='212.588' width='54' height='124' rx='15' transform='rotate(-45 174.405 212.588)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='282.592' y='259.964' width='32' height='96' style={{ opacity: hoursLeft >= 16 ? 1 : 0 }} rx='10' transform='rotate(135 282.592 259.964)' fill='#EEF2F6' />
				<rect x='106.098' y='313.182' width='54' height='124' rx='15' transform='rotate(-60 106.098 313.182)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='222.861' y='330.942' width='32' height='96' style={{ opacity: hoursLeft >= 17 ? 1 : 0 }} rx='10' transform='rotate(120 222.861 330.942)' fill='#EEF2F6' />
				<rect x='66.1586' y='428.029' width='54' height='124' rx='15' transform='rotate(-75 66.1586 428.029)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='183.539' y='414.965' width='32' height='96' style={{ opacity: hoursLeft >= 18 ? 1 : 0 }} rx='10' transform='rotate(105 183.539 414.965)' fill='#EEF2F6' />
				<rect x='57.3008' y='549.3' width='54' height='124' rx='15' transform='rotate(-90 57.3008 549.3)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='167.301' y='506.3' width='32' height='96' style={{ opacity: hoursLeft >= 19 ? 1 : 0 }} rx='10' transform='rotate(90 167.301 506.3)' fill='#EEF2F6' />
				<rect x='80.133' y='668.73' width='54' height='124' rx='15' transform='rotate(-105 80.133 668.73)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='175.256' y='598.726' width='32' height='96' style={{ opacity: hoursLeft >= 20 ? 1 : 0 }} rx='10' transform='rotate(75 175.256 598.726)' fill='#EEF2F6' />
				<rect x='133.098' y='778.182' width='54' height='124' rx='15' transform='rotate(-120 133.098 778.182)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='206.861' y='685.942' width='32' height='96' style={{ opacity: hoursLeft >= 21 ? 1 : 0 }} rx='10' transform='rotate(60 206.861 685.942)' fill='#EEF2F6' />
				<rect x='212.588' y='870.197' width='54' height='124' rx='15' transform='rotate(-135 212.588 870.197)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='259.965' y='762.009' width='32' height='96' style={{ opacity: hoursLeft >= 22 ? 1 : 0 }} rx='10' transform='rotate(45 259.965 762.009)' fill='#EEF2F6' />
				<rect x='313.183' y='938.502' width='54' height='124' rx='15' transform='rotate(-150 313.183 938.502)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='330.945' y='821.739' width='32' height='96' style={{ opacity: hoursLeft >= 23 ? 1 : 0 }} rx='10' transform='rotate(30 330.945 821.739)' fill='#EEF2F6' />
				<rect x='428.029' y='978.444' width='54' height='124' rx='15' transform='rotate(-165 428.029 978.444)' stroke='#EEF2F6' strokeWidth='6' />
				<rect x='414.965' y='861.062' width='32' height='96' style={{ opacity: hoursLeft >= 24 ? 1 : 0 }} rx='10' transform='rotate(15 414.965 861.062)' fill='#EEF2F6' />
			</g>
		</svg>
	)
}

export default Timer
