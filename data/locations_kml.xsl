<?xml version="1.0" encoding="UTF-8" ?>

<!--
Outputs a KML file with folders corresponding to top-level location tags.
The folders contain Placemark elements corresponding to second-level locations tags.
-->

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:gx="http://earth.google.com/kml/2.1"
	xmlns="http://earth.google.com/kml/2.1">
	
	<xsl:variable name="locations_kml" select="document('madison_neighborhoods_14613.kml')"/>
	
	<xsl:output
		method="xml"
		indent="yes"
	/>
	
	<!-- Output a KML document. -->
	<xsl:template match="/">
		<kml>
			<Document>
				<!-- <xsl:apply-templates select="$locations_kml//gx:Style"/> -->
				<xsl:apply-templates select="/locations/loc[not(parent)]"/>
			</Document>
		</kml>
	</xsl:template>
	
	<!-- Get the top-level locations and create Folders for them. -->
	<xsl:template match="loc[not(parent)]">
		<xsl:variable name="thisIndex" select="@index"/>
		<Folder>
			<xsl:attribute name="id">
				<xsl:value-of select="@index"/>
			</xsl:attribute>
			<name><xsl:value-of select="name"/></name>
			<description><xsl:value-of select="desc"/></description>
			
			<xsl:apply-templates select="/locations/loc[parent/@index=$thisIndex]"/>
		</Folder>
	</xsl:template>
	
	<!-- Get the second-level locations and copy their corresponding Placemark. -->
	<xsl:template match="loc[parent]">
		<xsl:variable name="locIndex" select="@index"/>
		<Placemark>
			<xsl:attribute name="id">
				<xsl:value-of select="$locIndex"/>
			</xsl:attribute>
			<xsl:apply-templates select="$locations_kml//gx:Placemark[@id=$locIndex]/*"/>
		</Placemark>
	</xsl:template>
	
	<!-- Copy attributes and/or children, depending on Xpath selection. -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>
	
</xsl:stylesheet>