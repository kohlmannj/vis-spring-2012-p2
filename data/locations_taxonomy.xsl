<?xml version="1.0" encoding="UTF-8" ?>

<!--

-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	
	<xsl:output
		method="xml"
		indent="yes"
		version="1.0"
		encoding="us-ascii"
	/>
	
	<xsl:template match="/locations">
		<locations>
			<!-- Copy attributes only. -->
			<xsl:apply-templates select="@*"/>
			<xsl:apply-templates select="loc[not(parent)]"/>
		</locations>
	</xsl:template>
	
	<xsl:template match="loc[not(parent)]">
		<xsl:variable name="thisIndex" select="@index"/>
		<loc>
			<!-- Copy attributes and children. -->
			<xsl:apply-templates select="@*|node()"/>
			<children>
				<xsl:apply-templates select="/locations/loc[parent/@index=$thisIndex]"/>
			</children>
		</loc>
	</xsl:template>
	
	<xsl:template match="loc">
		<loc>
			<!-- Copy attributes and children. -->
			<xsl:apply-templates select="@*|node()"/>
		</loc>
	</xsl:template>
	
	<!-- Copy attributes and/or children, depending on Xpath selection. -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>
	
</xsl:stylesheet>