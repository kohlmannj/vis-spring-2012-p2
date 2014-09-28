<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output
		method="text"
	/>
	
	<xsl:template match="/">
		<xsl:apply-templates select="/tags/tag">
			<xsl:sort select="count" data-type="number" order="descending"/><!--1st sort-->
			<xsl:sort select="name" data-type="text" order="ascending"/><!--2nd sort-->
		</xsl:apply-templates>
	</xsl:template>
	
	<!-- Copy attributes and/or children, depending on Xpath selection. -->
	<xsl:template match="tag">
		<xsl:value-of select="name"/>: <xsl:value-of select="count"/>&#10;
	</xsl:template>
</xsl:stylesheet>